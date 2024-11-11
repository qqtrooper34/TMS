<template>
  <div class="gantt-container">
    <!-- Кнопки управления зумом -->
    <div class="zoom-controls">
      <button
        v-for="(level, index) in zoomLevels"
        :key="index"
        @click="setZoomLevel(index)"
        :class="{ active: selectedZoom === index }"
      >
        {{ level.name }}
      </button>
    </div>

    <!-- Контейнер для оси X с верхним скроллом -->
    <div class="x-axis-container" ref="xAxisContainer">
      <svg :width="svgWidth + yAxisWidth" :height="50">
        <g ref="xAxisGroup" :transform="`translate(${yAxisWidth}, 30)`"></g>
      </svg>
    </div>

    <!-- Ограниченный по высоте контейнер с вертикальной прокруткой -->
    <div class="scrollable-chart-container">
      <!-- Прокручиваемая область для оси Y и графика -->
      <div class="chart-scroll-container" ref="chartScrollContainer">
        <!-- Ось Y (агенты) -->
        <div class="y-axis-container">
          <svg :width="yAxisWidth" :height="svgHeight">
            <g ref="yAxisGroup"></g>
          </svg>
        </div>

        <!-- График -->
        <div class="chart-content-container" ref="chartContentContainer">
          <svg :width="svgWidth" :height="svgHeight">
            <g ref="chartGroup"></g>
          </svg>
        </div>
      </div>
    </div>
    <div class="tooltip" ref="tooltip"></div>
  </div>
</template>


<script>
import * as d3 from 'd3';
import moment from 'moment-timezone';
import axios from "axios";

export default {
  props: {
    agents: {
      type: Array,
      required: true,
    },
    orders: {
      type: Array,
      required: true,
    },
    routes: {
      type: Array,
      required: true,
    },
    chartStart: {
      type: String,
      required: true,
    },
    chartEnd: {
      type: String,
      required: true,
    },
    filterDate: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      zoomLevels: [
        { name: '1 час', minutesPerStep: 60 },
        { name: '30 мин', minutesPerStep: 30 },
        { name: '15 мин', minutesPerStep: 15 },
        { name: '5 мин', minutesPerStep: 5 },
      ],
      selectedZoom: 0, // Индекс текущего уровня зума
      cellWidth: 100, // Ширина ячейки в пикселях
      yAxisWidth: 200, // Ширина оси Y
      startTime: null,
      endTime: null,
      timeScale: null,
      yScale: null,
      startPageX: 0,
      startPageY: 0,
      startRect: { left: 0, top: 0 },
      offsetX: 0,
      offsetY: 0,
    };
  },
  computed: {
    svgWidth() {
      const zoom = this.zoomLevels[this.selectedZoom];
      const totalMinutes = (this.endTime - this.startTime) / (1000 * 60);
      const steps = Math.ceil(totalMinutes / zoom.minutesPerStep);
      return steps * this.cellWidth;
    },
    svgHeight() {
      return this.agents.length * 40 + 100; // Высота SVG
    },
  },
  watch: {
    agents: 'drawChart',
    orders: 'drawChart',
    routes: 'drawChart',
    chartStart: 'drawChart',
    chartEnd: 'drawChart',
    filterDate: 'drawChart',
    selectedZoom: 'drawChart',
  },
  mounted() {
    this.drawChart();

    // Синхронизация прокрутки оси X и графика
    if (this.$refs.xAxisContainer && this.$refs.chartContentContainer) {
      this.$refs.xAxisContainer.addEventListener('scroll', this.syncChartScroll);
    } else {
      console.error('Не удалось найти xAxisContainer или chartContentContainer');
    }
  },
  beforeDestroy() {
    // Отвязываем обработчик события прокрутки
    if (this.$refs.xAxisContainer && this.$refs.chartContentContainer) {
      this.$refs.xAxisContainer.removeEventListener('scroll', this.syncChartScroll);
    }
  },
  methods: {
    setZoomLevel(index) {
      this.selectedZoom = index;
    },

    syncChartScroll(event) {
      const scrollLeft = event.target.scrollLeft;
      // Синхронизируем горизонтальную прокрутку графика с осью X
      if (this.$refs.chartContentContainer) {
        this.$refs.chartContentContainer.scrollLeft = scrollLeft;
      }
    },

  

    drawChart() {
      console.log('Отрисовка диаграммы');

      // Определяем начало и конец временной шкалы
      this.startTime = d3.timeHour.floor(new Date(this.chartStart));
      this.endTime = d3.timeHour.ceil(new Date(this.chartEnd));

      const margin = { top: 0, right: 20, bottom: 50, left: 0 }; // Отступы для chartGroup
      const width = this.svgWidth - margin.left - margin.right;
      const height = this.svgHeight - margin.top - margin.bottom;

      // Выбираем SVG для диаграммы и оси Y
      const chartSvg = d3.select(this.$refs.chartGroup);
      chartSvg.selectAll('*').remove(); // Очищаем предыдущие данные

      const yAxisSvg = d3.select(this.$refs.yAxisGroup);
      yAxisSvg.selectAll('*').remove(); // Очищаем предыдущие данные

      // Настраиваем шкалу времени
      const zoom = this.zoomLevels[this.selectedZoom];
      this.timeScale = d3.scaleTime()
        .domain([this.startTime, this.endTime])
        .range([0, width]);

      // Настраиваем шкалу Y
      this.yScale = d3.scaleBand()
        .domain(this.agents.map(agent => agent.name))
        .range([0, this.agents.length * 40])
        .padding(0.1);

      // Создаём ось Y
      const yAxis = d3.axisLeft(this.yScale);
      yAxisSvg
        .attr('transform', `translate(${this.yAxisWidth}, 0)`) // Смещение оси Y
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "14px"); // Увеличенный размер шрифта

      // Создаём ось X
      const xAxis = d3.axisTop(this.timeScale)
        .ticks(d3.timeMinute.every(zoom.minutesPerStep))
        .tickFormat(d3.timeFormat('%H:%M'));

      const xAxisSvg = d3.select(this.$refs.xAxisGroup);
      xAxisSvg.selectAll('*').remove(); // Очищаем предыдущие данные

      xAxisSvg.call(xAxis);

      // Стилизация оси X
      xAxisSvg.selectAll("path")
        .style("stroke", "#000")
        .style("stroke-width", "1px");

      xAxisSvg.selectAll("line")
        .style("stroke", "#000")
        .style("stroke-width", "1px");

      xAxisSvg.selectAll("text")
        .style("fill", "black")
        .style("font-size", "14px"); // Увеличенный размер шрифта

      // Рисуем рабочие часы агентов
      this.drawWorkingHours(chartSvg, margin.top, width, height);

      // Рисуем задачи
      this.drawTasks(chartSvg, margin.top, width, height);
    },

    drawWorkingHours(chartSvg, topMargin, width, height) {
      const zoom = this.zoomLevels[this.selectedZoom];
      const dateStr = this.filterDate
        ? moment(this.filterDate).format('YYYY-MM-DD')
        : moment(this.chartStart).format('YYYY-MM-DD');

      const tasksGroup = chartSvg.append('g').attr('class', 'tasks');

      this.agents.forEach(agent => {
        if (agent.time_start && agent.time_end) {

          const start = moment(`${dateStr} ${agent.time_start}`, 'YYYY-MM-DD HH:mm');
          const end = moment(`${dateStr} ${agent.time_end}`, 'YYYY-MM-DD HH:mm');

          if (!start.isValid() || !end.isValid()) {
            return;
          }

          const x = this.timeScale(start.toDate());
          const widthRect = this.timeScale(end.toDate()) - x;
          const y = this.yScale(agent.name);

          // Отрисовываем прямоугольник рабочего времени
          tasksGroup.append('rect')
            .attr('class', 'working-hours')
            .attr('x', x)
            .attr('y', y)
            .attr('width', widthRect)
            .attr('height', this.yScale.bandwidth())
            .attr('fill', '#d3d3d3')
            .attr('opacity', 0.5);

          // Отрисовываем чёрную линию посередине рабочего времени, начиная от оси Y
          tasksGroup.append('line')
            .attr('class', 'working-hours-line')
            .attr('x1', 0) // Начинаем от начала графика (после оси Y)
            .attr('y1', y + this.yScale.bandwidth() / 2)
            .attr('x2', x + widthRect)
            .attr('y2', y + this.yScale.bandwidth() / 2)
            .attr('stroke', 'black')
            .attr('stroke-width', 1);
        }
      });
    },

    drawTasks(chartSvg, topMargin, width, height) {
      const tasksGroup = chartSvg.select('.tasks');

      const rowHeight = this.yScale.bandwidth();

      const dateStr = this.filterDate
        ? moment(this.filterDate).format('YYYY-MM-DD')
        : moment(this.chartStart).format('YYYY-MM-DD');

      this.orders.forEach(order => {
        const agent = this.agents.find(agent => String(agent.pk) === String(order.pk_agent));
        if (!agent) {
          return;
        }

        const startTime = moment(order.plan_time_arrival, 'DD.MM.YYYY, HH:mm');
        if (!startTime.isValid()) {
          return;
        }

        const unloadMinutes = Number(order.plan_time_unload) || 0;
        const endTime = startTime.clone().add(unloadMinutes, 'minutes');

        const x = this.timeScale(startTime.toDate());
        const width = this.timeScale(endTime.toDate()) - x;
        const y = this.yScale(agent.name) + 5; // Отступ сверху
        const heightRect = rowHeight - 10;

        if (isNaN(x) || isNaN(width)) {
          return;
        }

        const route = this.routes.find(r => String(r.pk) === String(order.pk_route));
        const routeColor = route ? route.color : '#1976D2';

        // Создаём группу для задачи
        const taskGroup = tasksGroup.append('g')
          .attr('class', 'task-group')
          .attr('data-order-id', order.pk)
          .attr('data-x', 0) // Инициализация data-x
          .attr('data-y', 0) // Инициализация data-y
          .on('mouseover', (event) => this.showTooltip(event, order))
          .on('mousemove', (event) => this.moveTooltip(event))
          .on('mouseout', () => this.hideTooltip())
          .on('dblclick', () => this.$emit('open-order-modal', order));

        // Добавляем прямоугольник задачи в группу
        taskGroup.append('rect')
          .attr('class', 'task-bar')
          .attr('x', x)
          .attr('y', y)
          .attr('width', width)
          .attr('height', heightRect)
          .attr('fill', routeColor)
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('data-x', 0) // Инициализация data-x
          .attr('data-y', 0); // Инициализация data-y

        // Добавляем текст внутри задачи в группу
        taskGroup.append('text')
          .attr('x', x + width / 2)
          .attr('y', y + heightRect / 2)
          .attr('dy', '.35em')
          .text(String(order.route_num || ''))
          .attr('font-size', '10px')
          .attr('fill', '#fff')
          .attr('text-anchor', 'middle')
          .attr('data-x', 0) // Инициализация data-x
          .attr('data-y', 0); // Инициализация data-y
      });

  
    },



    canAddOrderToAgent(order, agent) {
      // Ваша логика проверки возможности добавить заказ к агенту
      return true;
    },

    async updateOrderData(order) {
      try {
        await axios.put(`http://185.155.18.145:15777/api/orders/${order.pk}`, order);
        // Обновление маршрута, если необходимо
      } catch (error) {
        console.error('Ошибка при обновлении заказа:', error);
      }
    },

    showTooltip(event, order) {
      const tooltip = this.$refs.tooltip;
      tooltip.style.display = 'block';
      tooltip.innerHTML = `
        <strong>Заказ №${order.pk}</strong><br/>
        Клиент: ${order.name}<br/>
        Адрес: ${order.addr}<br/>
        Временное окно: ${order.plan_time_begin} - ${order.plan_time_end}<br/>
        Время прибытия: ${order.plan_time_arrival}<br/>
        Время разгрузки: ${order.plan_time_unload} мин.
      `;
      this.moveTooltip(event);
    },

    moveTooltip(event) {
      const tooltip = this.$refs.tooltip;
      tooltip.style.left = `${event.pageX + 10}px`;
      tooltip.style.top = `${event.pageY + 10}px`;
    },

    hideTooltip() {
      const tooltip = this.$refs.tooltip;
      tooltip.style.display = 'none';
    },
  },
};
</script>







<style>
.gantt-container {
  position: relative; /* Для корректного позиционирования тултипа */
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  user-select: none; /* Отключаем выделение текста внутри компонента */
}

.zoom-controls {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}

.zoom-controls button {
  margin-right: 5px;
  padding: 5px 10px;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
  border-radius: 4px;
}

.zoom-controls button.active {
  background-color: #1976D2;
  color: #fff;
}

.x-axis-container {
  overflow-x: auto; /* Включаем горизонтальную прокрутку только здесь */
  overflow-y: hidden; /* Отключаем вертикальную прокрутку */
  background: white;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}

.x-axis-content {
  position: relative;
  width: max-content; /* Устанавливаем ширину по содержимому */
}

.scrollable-chart-container {
  max-height: 27vh; /* Ограничиваем высоту */
  overflow-y: auto; /* Включаем вертикальную прокрутку */
}

.chart-scroll-container {
  display: flex;
  /* Отключаем горизонтальную прокрутку */
  overflow-x: hidden;
}

.y-axis-container {
  width: 200px; /* yAxisWidth */
  flex-shrink: 0;
  background: white;
  border-right: 1px solid #ddd;
}

.chart-content-container {
  flex: 1;
  /* Отключаем горизонтальную прокрутку */
  overflow-x: hidden;
}

.chart-content-container svg {
  display: block;
}

.task-bar {
  stroke: black;
  stroke-width: 1px;
  cursor: pointer;
}

.x-axis path,
.x-axis line,
.y-axis path,
.y-axis line {
  stroke: #000;
}

.x-axis text,
.y-axis text {
  fill: black;
  font-size: 14px;
}

.working-hours {
  pointer-events: none;
}

.working-hours-line {
  pointer-events: none;
}

.tooltip {
  background-color: rgba(0, 0, 0, 0.7);
  color: #000000;
  padding: 5px 10px;
  border-radius: 4px;
  pointer-events: none;
  font-size: 12px;
  position: absolute;
  z-index: 10;
}

.task-group {
  user-select: none;
}


</style>

