<template>  
<div style="height: 15px;"></div>
  <div style="display: flex; width: 100%; height: 100%; gap: 0;"> <!-- Убираем пробел между элементами -->
    <!-- Индикатор загрузки: только один, размещён внутри v-container -->
    <v-overlay :model-value="isLoading" class="align-center justify-center">
      <v-progress-circular
        indeterminate
        size="64"
        width="8"
        color="primary"
      ></v-progress-circular>
    </v-overlay>



    <!-- Контейнер для агентов и заказов -->
      <!-- Левый столбец с таблицей агентов -->
    
      <div style="flex: 0 0 23%; flex-direction: column; height: 100%;">
  <v-data-table
    :headers="agentHeaders2"
    :items="agentsWithRouteInfo"
    class="elevation-1 text-caption"
    ref="agentTable"
    :fixed-header="true"
    height="92vh"

    density="compact"
    disable-pagination
    :items-per-page-options="[
      { value: 50, title: '50' },
      { value: 100, title: '100' },
      { value: -1, title: 'Все' },
    ]"
    items-per-page-text="Элементов на странице"
    :search="agentSearch"
    :hover="true"
    items-per-page="-1"
    :hide-default-footer="true"
    dense
  >
    <!-- Добавляем слот top для заголовка с кнопкой -->
    <template v-slot:top>
      <v-toolbar density="compact" height="42" flat>
        <v-toolbar-title>Водители</v-toolbar-title>
        
        <v-text-field
          v-model="agentSearch"
          append-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
          dense
          style="max-width: 120px;"
        ></v-text-field>
            <v-btn icon color="primary" @click="openAddAgentModal" >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
      </v-toolbar>
    </template>

    <!-- Слот для заголовка чекбокса -->
    <template v-slot:header.is_select="{ header }">
      <v-checkbox
        :input-value="allAgentsSelected"
        @change="toggleSelectAllAgents"
        hide-details
        class="pa-ma-0" 
      />

    </template>

    <!-- Слот для строк данных -->
    <template #item="{ item }">
      <tr @dblclick="openEditAgentModal(item)">
        <td style="width: 20px;">
          <v-checkbox
            v-model="item.is_select"
            @change="onSelectAgentChange(item)"
            hide-details
            class="pa-ma-0"
          />
        </td>
        <td>
          <div
            :style="{
              backgroundColor: item.routeInfo ? item.routeInfo.color : 'transparent',
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              margin: '0 auto',
            }"
          ></div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; align-items: flex-start;">
            <span style="font-size: 14px;">{{ item.name }}</span>
            <span v-if="item.routeInfo" style="font-size: 12px; color: grey;">
              <v-icon small color="primary">mdi-map-marker</v-icon> {{ item.routeInfo.route_stops }}
              <v-icon small color="primary">mdi-clock-outline</v-icon> {{ item.routeInfo.duration }}
              <v-icon small color="primary">mdi-road</v-icon> {{ item.routeInfo.plan_route_length }} км
            </span>
            <span v-else style="font-size: 12px; color: grey;">
          
            </span>
          </div>
        </td>
      </tr>
    </template>
  </v-data-table>
</div>


      <!-- Правый столбец с картой и таблицами -->
      <div class="right-column" style="flex: 0 0 77%; display: flex; flex-direction: column; height: 100%;">

        <!-- Контейнер инфографики и системных кнопок -->
        <div style="display: flex; align-items: center; justify-content: flex-start; flex-wrap: nowrap;">
  <!-- Инфографика -->
 

    <v-menu
    v-model="datemenu"
  :close-on-content-click="false"
  transition="scale-transition"
 >
      <template v-slot:activator="{ props }">

        <v-text-field
        class="pa-2 statistics-card"
          color="primary"
            variant="outlined"
            v-model="filterDateValue"
            label="Дата"
            min-width="130"
            readonly
            v-bind="props"
            @change="applyDateFilter"
          ></v-text-field>
      </template>
      <v-locale-provider locale="ru">
      <v-date-picker show-adjacent-months first-day-of-week="1" :hide-header="true"  
          color="primary"  @update:modelValue="onDateSelected"
          ></v-date-picker>
      </v-locale-provider>
    </v-menu>

   
        
   
  
   
    <!-- Карточка 1: Всего заказов -->
    <v-card class="pa-2 statistics-card" variant="outlined" >
      <div style="display: flex; align-items: center; justify-content: center;">
        <v-icon large color="primary">mdi-package-variant</v-icon>
        <span class="headline" style="margin-left: 5px;">{{ totalOrders }}</span>
      </div>
      <div style="text-align: center; margin-top: 3px;">Всего заказов</div>
    </v-card>

    <!-- Карточка 2: Свободных заказов -->
    <v-card class="pa-2 statistics-card" variant="outlined" >
      <div style="display: flex; align-items: center; justify-content: center;">
        <v-icon large color="primary">mdi-package-variant-closed</v-icon>
        <span class="headline" style="margin-left: 5px;">{{ freeOrders }}</span>
      </div>
      <div style="text-align: center; margin-top: 3px;">Свободных заказов</div>
    </v-card>

    <!-- Карточка 3: Заказов в маршрутах -->
    <v-card class="pa-2 statistics-card" variant="outlined" >
      <div style="display: flex; align-items: center; justify-content: center;">
        <v-icon large color="primary">mdi-truck-delivery</v-icon>
        <span class="headline" style="margin-left: 5px;">{{ ordersInRoutes }}</span>
      </div>
      <div style="text-align: center; margin-top: 3px;">Заказов в маршрутах</div>
    </v-card>

    <!-- Карточка 4: Общий вес -->
    <v-card class="pa-2 statistics-card" variant="outlined" > 
      <div style="display: flex; align-items: center; justify-content: center;">
        <v-icon large color="primary">mdi-weight-kilogram</v-icon>
        <span class="headline" style="margin-left: 5px;">{{ totalWeight }}</span>
      </div>
      <div style="text-align: center; margin-top: 3px;">Общий вес (кг)</div>
    </v-card>

    <!-- Карточка 5: Общий объем -->
    <v-card class="pa-2 statistics-card" variant="outlined" >
      <div style="display: flex; align-items: center; justify-content: center;">
        <v-icon large color="primary">mdi-cube-outline</v-icon>
        <span class="headline" style="margin-left: 5px;">{{ totalVolume }}</span>
      </div>
      <div style="text-align: center; margin-top: 3px;">Общий объём (м³)</div>
    </v-card>

    <!-- Карточка 6: Кол-во маршрутов -->
    <v-card class="pa-2 statistics-card" variant="outlined" >
      <div style="display: flex; align-items: center; justify-content: center;">
        <v-icon large color="primary">mdi-road-variant</v-icon>
        <span class="headline" style="margin-left: 5px;">{{ totalRoutes }}</span>
      </div>
      <div style="text-align: center; margin-top: 3px;">Кол-во маршрутов</div>
    </v-card>

    <!-- Карточка 7: Общий пробег -->
    <v-card class="pa-2 statistics-card" variant="outlined" >
      <div style="display: flex; align-items: center; justify-content: center;">
        <v-icon large color="primary">mdi-map-marker-distance</v-icon>
        <span class="headline" style="margin-left: 5px;">{{ totalDistance }}</span>
      </div>
      <div style="text-align: center; margin-top: 3px;">Общий пробег (км)</div>
    </v-card>

    <!-- Карточка 8: Общая продолжительность -->
    <v-card class="pa-2 statistics-card" variant="outlined" >
      <div style="display: flex; align-items: center; justify-content: center;">
        <v-icon large color="primary">mdi-clock-outline</v-icon>
        <span class="headline" style="margin-left: 5px;">{{ totalDuration }}</span>
      </div>
      <div style="text-align: center; margin-top: 3px;">Продолжительность</div>
    </v-card>
  </div>

        <!-- Карта -->
        <div class="map-container">
          <div id="map" style="width: 100%; height: 100%;"></div>
        </div>

        <!-- Отступ -->
        <div style="height: 1px;"></div>

        <!-- Таблицы заказов и маршрутов -->
        <div style="display: flex; align-items: center; justify-content: flex-start; flex-wrap: nowrap;">
          <v-toolbar density="compact" height="40" flat color="primary">
          <v-tabs v-model="activeTab" >
            <v-tab value="orders"  density="compact"  size="small" :slim="true" slider-color="orange">Заказы</v-tab>
            <v-tab value="routes" density="compact"  size="small" :slim="true" slider-color="orange">Маршруты</v-tab>
            <v-tab value="gantt" density="compact" size="small" :slim="true" slider-color="orange">График доставки</v-tab>
          </v-tabs>
     
          
  <!-- Пространство между закладками и кнопками -->
  <v-spacer></v-spacer>
  <v-text-field
  v-model="searchQuery"
  prepend-icon="mdi-magnify"
  label="Поиск"
  single-line
  hide-details
  dense
  style="max-width: 200px;"
></v-text-field>
<v-spacer></v-spacer>

  <!-- Кнопка "Спланировать маршруты" -->
  <v-btn color="white" density="compact" @click="openPlanningDialog">Спланировать маршруты</v-btn>
  <v-btn @click="toggleZones" icon :title="zonesVisible ? 'Скрыть зоны' : 'Показать зоны'">
  <v-icon>
    {{ zonesVisible ? 'mdi-eye-off' : 'mdi-eye' }}
  </v-icon>
</v-btn>
  <!-- Кнопка "приязка зон" -->
  <v-btn icon @click="assignZonesToOrders" :title="'Назначить зоны заказам'">
    <v-icon>mdi-map-marker-radius</v-icon>
  </v-btn>

  
</v-toolbar>
   </div>
          <v-window v-model="activeTab" >
            <v-window-item value="orders" transition="false" reverse-transition="false">
           
    <!-- Элементы управления фильтром -->
    <div style="display: flex; flex-direction: column; gap: 4px;">
    
        <div class="filter-buttons">
          <div style="margin-bottom: 5px;">
             <!-- Кнопка "Добавить заказ" -->
  <v-btn color="green"     density="compact"
  size="small" prepend-icon="mdi-plus"  @click="openAddOrderModal">
    Добавить заказ
  </v-btn>
          <v-btn
            density="compact"
            size="small"  prepend-icon="mdi-filter-check-outline"
            :class="{ active: orderRouteFilter === 'inRoute' }"
            @click="toggleRouteFilter('inRoute')"
          >
            В маршруте
          </v-btn>
          <v-btn
            density="compact"
            size="small"  prepend-icon="mdi-filter-check-outline"
            :class="{ active: orderRouteFilter === 'notInRoute' }"
            @click="toggleRouteFilter('notInRoute')"
          >
            Свободные
          </v-btn>
          <v-btn
             density="compact"
            size="small"  prepend-icon="mdi-filter-check-outline"
            :class="{ active: orderLinkFilter === 'unlinked' }"
            @click="toggleLinkFilter('unlinked')"
          >
            Непривязанные
          </v-btn>
          
        
 <v-btn color="grey"  
 density="compact"
 size="small"   prepend-icon="mdi-map-marker-alert-outline"
 @click="openAddressBindingModalForSelectedOrders">
  Привязать адреса
</v-btn>
    </div>
      </div>
  
   

    <div v-if="filteredOrders && filteredOrders.length > 0" >
      <div style="display: flex; align-items: center; justify-content: flex-start; flex-wrap: nowrap;">
  <v-data-table
    density="compact"
    :headers="displayedOrderHeaders"
    :items="paginatedOrders"
    class="elevation-1 text-caption"
    ref="orderTable"
    :fixed-header="true"
    :height="computedTableHeight"
    :multi-sort="true"
    :search ="searchQuery"
    :hover="true"
    items-per-page="100"
    :hide-default-footer="true"
    :items-per-page-options="[
          { value: 100, title: '100' },
          { value: 200, title: '200' },
          { value: 250, title: '250' }
        ]"
        items-per-page-text="Элементов на странице"
        dense

  >


 <!-- Слот для заголовка чекбокса и меню выбора столбцов -->
 <template #header.is_select slot-scope="props">
      <v-menu v-model="isMenuOpen" offset-y :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn icon size="x-small" v-bind="props">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-card style="max-width: 350px;">
          <v-select
            v-model="visibleOrderColumns"
            :items="headersorders.filter(header => header.value !== 'is_select')"
            label="Выберите столбцы"
            multiple
            dense
          >
            <template v-slot:selection="{ item, index }">
              <v-chip v-if="index < 1">
                <span>Укажите требуемые вам колонки</span>
              </v-chip>
            </template>
          </v-select>
          <div style="display: flex; justify-content: space-between; margin-top: 10px;">
            <v-btn small text @click="selectAllColumns">Выбрать все</v-btn>
          </div>
        </v-card>
      </v-menu>
    </template>
    <!-- Слот для строк данных -->

    
    <template v-slot:item="{ item }">
      <tr @dblclick="openEditOrderModal(item)">
        <!-- Checkbox для выбора строки -->
        <td v-if="visibleOrderColumns.includes('is_select')" style="width: 40px;">
          <v-checkbox
            v-model="item.is_select"
            @change="onSelectChange(item)"
            hide-details
            class="pa-0 ma-0"
          />
        </td>
        <!-- Отображение кода заказа с кастомной логикой -->
        <td v-if="visibleOrderColumns.includes('code')">
          <div style="display: flex; align-items: center;">
            <span
              :style="{
                backgroundColor: item.routeInfo ? item.routeInfo.color : 'transparent',
                visibility: item.routeInfo ? 'visible' : 'hidden',
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                marginRight: '7px',
              }"
            ></span>
            {{ item.code }}
          </div>
        </td>

        <!-- Имя заказа -->
        <td v-if="visibleOrderColumns.includes('name')">{{ item.name }}</td>

        <!-- Адрес -->
        <td v-if="visibleOrderColumns.includes('addr')">
          <div class="address-cell">
            <div style="display: flex; align-items: center;">
              <span>{{ item.addr }}</span>
              <v-btn
                icon
                size="small"
                @click.stop="openAddressBindingModal(item)"
                v-if="!isOrderLinked(item)"
                :title="'Привязать адрес'"
              >
                <v-icon color="primary" size="small">mdi-map-marker-plus</v-icon>
              </v-btn>
            </div>
          </div>
        </td>
        <td v-if="visibleOrderColumns.includes('plan_time_begin')">     <div class="address-cell">
          <div style="display: flex; align-items: center;">{{ item.plan_time_begin }} </div>
        </div></td>
        <td v-if="visibleOrderColumns.includes('plan_time_end')">     <div class="address-cell">
          <div style="display: flex; align-items: center;">{{ item.plan_time_end }} </div>
        </div></td>
        <td v-if="visibleOrderColumns.includes('contact_name')">{{ item.contact_name }}</td>
        <td v-if="visibleOrderColumns.includes('contact_phone')">{{ item.contact_phone }}</td>
        <td v-if="visibleOrderColumns.includes('comment')">     <div class="address-cell">
          <div style="display: flex; align-items: center;">{{ item.comment }} </div>
        </div></td>
        <td v-if="visibleOrderColumns.includes('priority')">{{ item.priority }}</td>
        <td v-if="visibleOrderColumns.includes('weight')">{{ item.weight }}</td>
        <td v-if="visibleOrderColumns.includes('volume')">{{ item.volume }}</td>
       <!-- Отображение типа работы -->
       <td v-if="visibleOrderColumns.includes('worktype_desc')">
      {{ getWorkTypeNameById(item.work_type) }}
    </td>
        <td v-if="visibleOrderColumns.includes('plan_time_unload')">{{ item.plan_time_unload }}</td>
        <td v-if="visibleOrderColumns.includes('sign')">{{ item.sign }}</td>
        <td v-if="visibleOrderColumns.includes('remark')">{{ item.remark }}</td>
        <td v-if="visibleOrderColumns.includes('zone_name')">{{ item.zone_name }}</td>
        <td v-if="visibleOrderColumns.includes('route_num')">{{ item.route_num }}</td>
        <td v-if="visibleOrderColumns.includes('plan_time_arrival')">{{ item.plan_time_arrival }}</td>
        <td v-if="visibleOrderColumns.includes('driver_name')">{{ item.driver_name }}</td>
        <td v-if="visibleOrderColumns.includes('skills')">
        <div>
          <v-chip-group column>
            <v-chip
              v-for="(skillId, index) in item.skills"
              :key="index"
              density="compact"
              color="primary"
              class="ma-1"
              size="x-small"
            >
              {{ getSkillNameById(skillId) }}
            </v-chip>
          </v-chip-group>
        </div>
      </td>
        <td v-if="visibleOrderColumns.includes('free')">{{ item.free }}</td>
      </tr>
    </template>


  </v-data-table>
</div>


              </div>
              <div v-else>
                <p>Нет данных для отображения. Пожалуйста выберите дату с заказами или загрузите новые</p>
              </div>
            </div>
            </v-window-item>

  <!-- Таблица маршрутов -->
  <v-window-item value="routes" transition="false" reverse-transition="false">
    <!-- Элементы управления фильтром -->
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between;">
        <div class="filter-buttons">
          <div style="margin-bottom: 5px;">
      
      <v-btn     density="compact"
            size="small" prepend-icon="mdi-plus"
        color="green" @click="openCreateRouteDialog">Создать маршрут</v-btn>

        <v-btn
               density="compact"
            size="small"
        color="red" prepend-icon="mdi-delete"
        :disabled="!hasSelectedRoutes"
        @click="openDeleteRoutesDialog"
      >
        Удалить маршруты
      </v-btn>
    </div>
        </div>
  

      </div>
    </div>
    <div v-if="routes && routes.length > 0">
      <v-data-table
        density="compact"
        :headers="routeHeaders"
        item-key="pk"
        :items="routes"
        class="elevation-1 text-caption"
        ref="routeTable"
        fixed-header
        :height="computedTableHeight"
        :items-per-page-options="[
          { value: 50, title: '50' },
          { value: 100, title: '100' },
          { value: 200, title: '200' },
          { value: -1, title: 'Все' }
        ]"
        items-per-page-text="Элементов на странице"
        multi-sort
        :search="searchQuery"
          :hover="true"
    items-per-page="-1"
    :hide-default-footer="true"
    dense
      >
        <!-- Слот для заголовка чекбокса -->
        <template v-slot:header.is_select="{ header }">
          <v-checkbox
            v-model="allRoutesSelected"
            hide-details
            class="pa-0 ma-0"
          />
        </template>
        <template #item="{ item }">
          <tr @dblclick="openEditRouteModal(item)">
            <td style="width: 40px;">
              <v-checkbox
                v-model="item.is_select"
                @change="updateSelectedRoutes(item)"
                hide-details
                class="pa-0 ma-0"
              />
            </td>
            <td>
              <div :style="{ backgroundColor: item.color, width: '20px', height: '20px' }"></div>
            </td>
            <td>{{ item.pk }}</td>
            <td><div style="display: flex; align-items: center;">
      <span>{{ item.name }}</span>
      <v-icon
        small
        class="ml-2"
        @click="openEditRouteDialog(item)"
      >
        mdi-pencil
      </v-icon>
    </div></td>
            <td>{{ item.code }}</td>
            <td>{{ item.begin_time }}</td>
            <td>{{ item.end_time }}</td>
            <td><div style="display: flex; align-items: center;">
      <span>{{ item.driver }}</span>
      <v-icon
        small
        class="ml-2"
        @click="openChangeDriverDialog(item)"
      >
        mdi-account-edit
      </v-icon>
    </div></td>
            <td>{{ item.route_weight }}</td>
            <td>{{ item.route_volume }}</td>
            <td>{{ item.route_stops }}</td>
            <td>{{ item.duration }}</td>
            <td>{{ item.plan_route_length }}</td>
            <td>{{ item.cost }}</td>
            <td>
        <v-icon @click="openRouteTimelineDrawer(item)">mdi-chevron-right</v-icon>
      </td>
            <!-- Остальные поля -->
          </tr>
        </template>
      </v-data-table>
    </div>
    <div v-else>
      <p>Нет спланированных маршрутов</p>
    </div>
  </v-window-item>
            <!-- Вкладка с диаграммой Ганта -->
            <v-window-item value="gantt" transition="false" reverse-transition="false">
              <CustomGanttChart
    :agents="agentsWithRouteInfo1"
    :orders="filteredOrders"
    :routes="routes" 
    :chart-start="chartStart"
    :chart-end="chartEnd"
   @open-order-modal="openEditOrderModal"
  />
    </v-window-item>
          </v-window>
       <!-- Тулбар с пагинацией, закреплённый внизу -->
       <div class="sticky-pagination" v-if="isPaginationVisible">
    <v-toolbar flat density="compact" height="40" color="primary">
      <v-autocomplete
        v-model="itemsPerPage"
        :items="[50, 100, 200, 500]"
        dense
        hide-details
        :flat="true"
        style="max-width: 120px;"
      ></v-autocomplete>
      <v-pagination
        v-model="currentPage"
        :length="pageCount"
        total-visible="7"
        size="small"
        active-color="black"
      ></v-pagination>
    </v-toolbar>
      </div>
    </div>
  </div>
      


    <!-- Модальные окна -->
    <!-- Модальное окно для редактирования агента -->
    <v-dialog v-model="agentDialog" max-width="600">
      <v-card>
        <v-card-title>Редактировать агента</v-card-title>
        <v-card-text>
          <v-form ref="agentForm">
            <v-text-field v-model="currentAgent.pk" label="Код" disabled></v-text-field>
            <v-text-field v-model="currentAgent.name" label="Имя агента"></v-text-field>
            <v-text-field v-model="currentAgent.code" label="Код агента"></v-text-field>
            <v-text-field v-model="currentAgent.phone" label="Телефон"></v-text-field>
            <v-text-field v-model="currentAgent.time_start" label="Время начала"></v-text-field>
            <v-text-field v-model="currentAgent.time_end" label="Время окончания"></v-text-field>
            <v-text-field v-model="currentAgent.start_stock_name" label="Склад начала"></v-text-field>
            <v-text-field v-model="currentAgent.end_stock_name" label="Склад окончания"></v-text-field>
            <v-checkbox v-model="currentAgent.is_active" label="Активен"></v-checkbox>
            <v-text-field v-model="currentAgent.weight_max" label="Макс. вес"></v-text-field>
            <v-text-field v-model="currentAgent.volume_max" label="Макс. объем"></v-text-field>
            <v-text-field v-model="currentAgent.login" label="Логин"></v-text-field>
            <v-text-field v-model="currentAgent.psw" label="Пароль"></v-text-field>
            <v-text-field v-model="currentAgent.distance_limit" label="Максимальный пробег"></v-text-field>
            <v-text-field v-model="currentAgent.overtime" label="Переработка"></v-text-field>
            <v-text-field v-model="currentAgent.fixed_cost" label="Стоимость выезда"></v-text-field>
            <v-text-field v-model="currentAgent.cost_per_km" label="Стоимость за КМ"></v-text-field>
            <v-select
  v-model="currentAgent.zones"
  :items="zones"
  item-title="name"
  item-value="pk"
  label="Зоны"
  multiple
  chips
></v-select>

<v-select
  v-model="currentAgent.skills"
  :items="skills"
  item-title="name"
  item-value="pk"
  label="Навыки"
  multiple
  chips
></v-select>
            <!-- Остальные поля -->
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="agentDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="submitAgentForm">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Модальное окно для добавления нового заказа -->
    <v-dialog v-model="addOrderDialog" max-width="600">
      <v-card>
        <v-card-title>Добавить новый заказ</v-card-title>
        <v-card-text>
          <v-form ref="addForm">
            <v-text-field v-model="newOrder.code" label="Код доставки"></v-text-field>
            <v-text-field v-model="newOrder.name" label="Имя"></v-text-field>
            <v-text-field v-model="newOrder.addr" label="Адрес"></v-text-field>
            <v-text-field v-model="newOrder.plan_time_begin" label="Времянное окно старт"></v-text-field>
            <v-text-field v-model="newOrder.plan_time_end" label="Времянное окно конец"></v-text-field>
            <v-text-field v-model="newOrder.contact_name" label="Контакт"></v-text-field>
            <v-text-field v-model="newOrder.contact_phone" label="Телефон"></v-text-field>
            <v-text-field v-model="newOrder.comment" label="Комментарий"></v-text-field>
            <v-text-field v-model="newOrder.priority" label="Приоритет"></v-text-field>
            <v-text-field v-model="newOrder.weight" label="Вес"></v-text-field>
            <v-text-field v-model="newOrder.volume" label="Объем"></v-text-field>
            <v-select
          v-model="newOrder.work_type" 
          :items="workTypes"
          item-title="worktype"
          item-value="pk"
          label="Тип работы"
          required
        ></v-select>
            <v-text-field v-model="newOrder.plan_time_unload" label="Время на разгрузку"></v-text-field>
            <v-text-field v-model="newOrder.sign" label="Бренд"></v-text-field>
            <v-text-field v-model="newOrder.remark" label="Примечание"></v-text-field>
            <v-select
          v-model="newOrder.skills"
          :items="skills"
          item-title="name"
          item-value="pk"
          label="Требуемые навыки"
          multiple
          chips
        ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="addOrderDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="submitNewOrder">Добавить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Модальное окно для редактирования заказа -->
    <v-dialog v-model="editOrderDialog" max-width="600">
      <v-card>
        <v-card-title>Редактировать заказ</v-card-title>
        <v-card-text>
          <v-form ref="editForm">
            <v-text-field v-model="selectedOrder.pk" label="Код" disabled></v-text-field>
            <v-text-field v-model="selectedOrder.code" label="Код доставки"></v-text-field>
            <v-text-field v-model="selectedOrder.name" label="Имя"></v-text-field>
            <v-text-field v-model="selectedOrder.addr" label="Адрес"></v-text-field>
            <v-text-field v-model="selectedOrder.plan_time_begin" label="Времянное окно старт"></v-text-field>
            <v-text-field v-model="selectedOrder.plan_time_end" label="Времянное окно конец"></v-text-field>
            <v-text-field v-model="selectedOrder.plan_lon_x" label="X"></v-text-field>
            <v-text-field v-model="selectedOrder.plan_lat_y" label="Y"></v-text-field>
            <v-text-field v-model="selectedOrder.contact_name" label="Контакт"></v-text-field>
            <v-text-field v-model="selectedOrder.contact_phone" label="Телефон"></v-text-field>
            <v-text-field v-model="selectedOrder.comment" label="Комментарий"></v-text-field>
            <v-text-field v-model="selectedOrder.priority" label="Приоритет"></v-text-field>
            <v-text-field v-model="selectedOrder.weight" label="Вес"></v-text-field>
            <v-text-field v-model="selectedOrder.volume" label="Объем"></v-text-field>
            <v-select
          v-model="selectedOrder.work_type" 
          :items="workTypes"
          item-title="worktype"
          item-value="pk"
          label="Тип работы"
          required
        ></v-select>
            <v-text-field v-model="selectedOrder.plan_time_unload" label="Время на разгрузку"></v-text-field>
            <v-text-field v-model="selectedOrder.sign" label="Бренд"></v-text-field>
            <v-text-field v-model="selectedOrder.remark" label="Примечание"></v-text-field>
            <v-select
  v-model="selectedOrder.skills"
  :items="skills"
  item-title="name"
  item-value="pk"
  label="Требуемые навыки"
  multiple
  chips
></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="editOrderDialog = false">Отмена</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="red" @click="confirmDeleteOrder">Удалить</v-btn>
          <v-btn color="primary" @click="submitEditOrder">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Модальное окно для добавления нового водителя -->
    <v-dialog v-model="addAgentDialog" max-width="600">
      <v-card>
        <v-card-title>Добавить водителя</v-card-title>
        <v-card-text>
          <v-form ref="addAgentForm">
            <v-text-field v-model="newAgent.name" label="Имя"></v-text-field>
            <v-text-field v-model="newAgent.code" label="Код агента"></v-text-field>
            <v-text-field v-model="newAgent.phone" label="Телефон"></v-text-field>
            <v-text-field v-model="newAgent.time_start" label="Время начала" type="time"></v-text-field>
            <v-text-field v-model="newAgent.time_end" label="Время окончания" type="time"></v-text-field>
            <v-text-field v-model="newAgent.login" label="Логин"></v-text-field>
            <v-text-field v-model="newAgent.psw" label="Пароль" type="password"></v-text-field>
            <v-checkbox v-model="newAgent.is_active" label="Активен"></v-checkbox>
            <v-text-field v-model="newAgent.weight_max" label="Макс. вес" type="number"></v-text-field>
            <v-text-field v-model="newAgent.volume_max" label="Макс. объем" type="number"></v-text-field>

            <v-select
          v-model="newAgent.zones"
          :items="zones"
          item-title="name"
          item-value="pk"
          label="Зоны"
          multiple
          chips
        ></v-select>

        <v-select
          v-model="newAgent.skills"
          :items="skills"
          item-title="name"
          item-value="pk"
          label="Навыки"
          multiple
          chips
        ></v-select>
            <!-- Остальные поля -->
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="addAgentDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="submitNewAgent">Добавить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Модальное окно планирования маршрутов -->
    <v-dialog v-model="planningDialog" max-width="800">
      <v-card>
        <v-card-title>Планирование маршрутов</v-card-title>
        <v-card-text>
          <!-- Таблица водителей -->
          <v-data-table
            :headers="planningAgentHeaders"
            :items="agents"
            class="elevation-1 text-caption"
            ref="agentPlanningTable"
            :hide-default-header="true"
            :hover="true"
            dense
    items-per-page="20"
   :search="agentSearch"
          >    
          <template v-slot:top>
        <v-text-field
          v-model="agentSearch"
          append-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
          dense
          style="max-width: 150px;"
        ></v-text-field>
    </template>
          <template #thead>
              <thead>
                <tr>
                  <th class="sticky-header">
                    <v-checkbox
                      :value="allAgentsSelected"
                      @change="toggleSelectAllAgents"
                    />
                  </th>
                  <th class="sticky-header">Имя</th>
                  <th class="sticky-header">Время с</th>
                  <th class="sticky-header">Время по</th>
                  <th class="sticky-header">Макс. вес</th>
                  <th class="sticky-header">Макс. объем</th>
                </tr>
              </thead>
            </template>

            <template #item="{ item }">
              <tr>
                <td>
                  <v-checkbox v-model="item.is_select" @change="onSelectAgentChange(item)" />
                </td>
                <td>{{ item.name }}</td>
                <td>{{ item.time_start }}</td>
                <td>{{ item.time_end }}</td>
                <td>{{ item.weight_max }}</td>
                <td>{{ item.volume_max }}</td>
              </tr>
            </template>
          </v-data-table>

          <!-- Параметры планирования -->
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="planningParams.unloadTime" label="Время разгрузки заказов (мин)" type="number"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="planningParams.maxDriverWorkTime" label="Макс. время работы водителя (ч)" type="number"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="planningParams.maxRouteLength" label="Макс. длина маршрута (км)" type="number"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="planningParams.maxTasks" label="Макс. кол-во точек" type="number"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-checkbox v-model="planningParams.startFromWarehouse" label="Начинать со склада"></v-checkbox>
            </v-col>
            <v-col cols="6">
              <v-checkbox v-model="planningParams.returnToStock" label="Возвращаться на склад"></v-checkbox>
            </v-col>
            <v-col cols="6">
              <v-checkbox v-model="planningParams.considerZones" label="Учитывать зоны"></v-checkbox>
            </v-col>
            <v-col cols="6">
              <v-checkbox v-model="planningParams.considerSkills" label="Учитывать навыки"></v-checkbox>
            </v-col>

            <v-alert type="warning" v-if="isPlanButtonDisabled">
  Необходимо выбрать хотя бы "Начинать со склада" или "Возвращаться на склад".
</v-alert>
          </v-row>

          <!-- Сценарии планирования -->
          <v-radio-group v-model="planningScenario" label="Сценарий планирования">
            <v-radio label="Планировать все заказы" value="all"></v-radio>
            <v-radio label="Сохранять текущие маршруты без добавления новых заказов" value="keepExistingNoNew"></v-radio>
            <v-radio label="Сюда пока не жать" value="keepExistingWithNew"></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="closePlanningDialog">Закрыть</v-btn>
          <v-btn color="primary" @click="planRoutes" :disabled="isPlanButtonDisabled">
  Планировать маршруты
</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления заказа -->
    <v-dialog v-model="deleteConfirmationDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Подтверждение удаления</v-card-title>
        <v-card-text>Вы уверены, что хотите удалить этот заказ?</v-card-text>
        <v-card-actions>
          <v-btn @click="deleteConfirmationDialog = false">Отмена</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="red" @click="deleteOrder(selectedOrder.pk)">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Модальное окно для редактирования маршрута -->
    <v-dialog v-model="editRouteDialog" max-width="600">
      <v-card>
        <v-card-title>Редактировать маршрут</v-card-title>
        <v-card-text>
          <v-form ref="editRouteForm">
            <v-text-field v-model="selectedRoute.pk" label="Код" disabled></v-text-field>
            <v-text-field v-model="selectedRoute.name" label="Название"></v-text-field>
            <v-text-field v-model="selectedRoute.code" label="Код маршрута"></v-text-field>
            <v-text-field v-model="selectedRoute.pk_agent" label="Код водителя"></v-text-field>
            <v-text-field v-model="selectedRoute.driver" label="Водитель"></v-text-field>
            <v-text-field v-model="selectedRoute.begin_time" label="Начало"></v-text-field>
            <v-text-field v-model="selectedRoute.end_time" label="Окончание"></v-text-field>
            <v-text-field v-model="selectedRoute.plan_route_length" label="Плановая длина маршрута"></v-text-field>
            <v-text-field v-model="selectedRoute.duration" label="Длительность"></v-text-field>
            <!-- Остальные поля -->
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="editRouteDialog = false">Отмена</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="red" @click="confirmDeleteRoute">Удалить</v-btn>
          <v-btn color="primary" @click="submitEditRoute">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления маршрута -->
    <v-dialog v-model="deleteRouteConfirmationDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Подтверждение удаления</v-card-title>
        <v-card-text>Вы уверены, что хотите удалить этот маршрут?</v-card-text>
        <v-card-actions>
          <v-btn @click="deleteRouteConfirmationDialog = false">Отмена</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="red" @click="deleteRoute(selectedRoute.pk)">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  <!-- Диалог привязки -->
    <v-dialog v-model="addressBindingDialog" max-width="600px">
  <v-card>
    <v-card-title>
      Привязка адреса
    </v-card-title>
    <v-card-text>
      <!-- Код заказа (только для чтения) -->
      <v-text-field
        v-model="currentOrderCode"
        label="Код заказа"
        readonly
      ></v-text-field>

      <!-- Наименование заказа (только для чтения) -->
      <v-text-field
        v-model="currentOrderName"
        label="Наименование заказа"
        readonly
      ></v-text-field>

      <!-- Поле адреса (редактируемое) -->
      <v-text-field
        v-model="currentOrderAddress"
        label="Адрес"
      ></v-text-field>

      <!-- Кнопка для геокодирования адреса -->
      <v-btn color="primary" @click="geocodeAddress">
        Привязать
      </v-btn>

      <!-- Отображаем варианты адресов, если они есть -->
      <div v-if="geocodedAddresses.length > 0" style="margin-top: 20px;">
        <p>Выберите правильный адрес:</p>
        <v-radio-group v-model="selectedGeocodedAddress">
          <v-radio
            v-for="(address, index) in geocodedAddresses"
            :key="index"
            :label="address.formattedAddress"
            :value="address"
          ></v-radio>
        </v-radio-group>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="closeAddressBindingDialog">
        Отмена
      </v-btn>
      <v-btn color="primary" @click="bindSelectedAddress" :disabled="!selectedGeocodedAddress">
        Сохранить
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
<!-- Диалог подтверждения массового удаления маршрутов -->
<v-dialog v-model="deleteRoutesConfirmationDialog" max-width="500">
  <v-card>
    <v-card-title class="headline">Подтверждение удаления</v-card-title>
    <v-card-text>
      Вы уверены, что хотите удалить выбранные маршруты? Это действие невозможно отменить.
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="deleteRoutesConfirmationDialog = false">Отмена</v-btn>
      <v-btn color="red" @click="deleteSelectedRoutes">Удалить</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>


<!-- Диалог смены водителя -->
<v-dialog v-model="changeDriverDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Сменить водителя для маршрута</span>
        </v-card-title>
        <v-card-subtitle>
          Маршрут: {{ selectedRouteForDriverChange?.name }} <br />
          Текущий водитель: {{ selectedRouteForDriverChange?.driver }}
        </v-card-subtitle>

        <!-- Поле для выбора водителя с автодополнением -->
        <v-autocomplete
  v-model="selectedDriver"
  :items="availableDrivers"
  :item-value="driver => driver.pk"
  item-title="name"
  label="Выберите водителя"
  hide-details
  clearable
  :loading="isLoadingDrivers"
  :search-input.sync="searchQuery"
  return-object
  @change="onDriverSelected"
>
 <!-- Настройка отображения каждого элемента через слот item -->
 <template v-slot:item="{ props, item }">
    <v-list-item
      v-bind="props"
      :class="{
        'red-text': !canFitOrders(item.raw),    // Красный текст, если водитель не может вместить заказы
        'yellow-text': isAgentBusy(item.raw)    // Жёлтый текст, если водитель занят
      }"
    >
      <v-list-item
        v-bind="props"
        :subtitle="`(Начинаю в: ${item.raw.time_start}, Заканчиваю в: ${item.raw.time_end})`"
        :title="`(Вес: ${item.raw.weight_max}, Объем: ${item.raw.volume_max})`"
      ></v-list-item>
    </v-list-item>
  </template>
</v-autocomplete>

        <!-- Кнопки действия -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn 
            color="green darken-1" 
            text 
            @click="openConfirmDialog" 
            :disabled="!selectedDriver"
          >
            Применить
          </v-btn>
          <v-btn 
            color="blue darken-1" 
            text 
            @click="changeDriverDialog = false"
          >
            Отмена
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения смены водителя -->
    <v-dialog v-model="confirmDriverChangeDialog" max-width="400px">
      <v-card>
        <v-card-title>Подтвердите смену водителя</v-card-title>
        <v-card-text>
          Вы уверены, что хотите сменить водителя
          <strong>{{ selectedRouteForDriverChange.driver }}</strong> 
          на <strong>{{ selectedDriver?.name }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="applyDriverChange">Да</v-btn>
          <v-btn color="red darken-1" text @click="confirmDriverChangeDialog = false">Отмена</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Диалоговое окно для ввода названия маршрута -->
<v-dialog v-model="routeNameDialog" max-width="500">
  <v-card>
    <v-card-title>
      Введите название маршрута
    </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="newRouteName"
        label="Название маршрута"
        required
      ></v-text-field>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="routeNameDialog = false">Отмена</v-btn>
      <v-btn color="primary" @click="confirmAddOrdersToRoute">Далее</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<!-- Диалоговое окно подтверждения добавления выбранных заказов -->
<v-dialog v-model="addSelectedOrdersDialog" max-width="500">
  <v-card>
    <v-card-title>
      Добавить выбранные заказы?
    </v-card-title>
    <v-card-text>
      Вы выбрали {{ selectedOrdersCount }} заказов. Хотите добавить их в маршрут "{{ newRouteName }}"?
    </v-card-text>
    <v-card-actions>
      <v-btn text @click="openRouteBuilderDialog(false)">Нет</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="openRouteBuilderDialog(true)">Да</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<v-dialog v-model="routeBuilderDialog" max-width="1000">
  <v-card>
    <v-card-title>
      {{ isEditingRoute ? 'Редактирование маршрута' : 'Сборка маршрута' }}: {{ newRouteName }}
      <v-spacer></v-spacer>
      <v-btn text @click="closeRouteBuilderDialog">Отмена</v-btn>
      <v-btn color="primary" @click="saveRoute">{{ isEditingRoute ? 'Сохранить изменения' : 'Сохранить' }}</v-btn>
    </v-card-title>
    <v-card-text>
      <!-- Добавляем выбор склада -->
      <v-select
        v-model="selectedWarehouse"
        :items="stocks"
        item-title="name"
        item-value="gid"
        label="Выберите склад"
        required
      ></v-select>
      <v-row>
        <!-- Список свободных заказов -->
        <v-col cols="6">
          <h3>
            Свободные заказы
            <br>
            Вес: {{ totalAvailableWeight }} кг, Объём: {{ totalAvailableVolume }} м³
          </h3>
          <v-text-field
            v-model="searchAvailable"
            label="Поиск по свободным заказам"
            clearable
          ></v-text-field>
          <draggable
            v-model="availableOrders"
            :group="'orders'"
            item-key="pk"
            class="list"
          >
            <template #item="{ element, index }">
              <div v-if="isInFilteredAvailable(element)" :key="element.pk">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>{{ element.code }} - {{ element.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ element.addr }}</v-list-item-subtitle>
                    <v-list-item-subtitle>{{ element.plan_time_begin}} - {{ element.plan_time_end}}</v-list-item-subtitle>
                    <v-list-item-subtitle>Вес: {{ element.weight }} кг, Объём: {{ element.volume }} м³</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </div>
            </template>
          </draggable>
        </v-col>

        <!-- Список заказов в маршруте -->
        <v-col cols="6">
          <h3>
            Заказы в маршруте
            <br>
            Вес: {{ totalRouteWeight }} кг, Объём: {{ totalRouteVolume }} м³
          </h3>
          <v-text-field
            v-model="searchRoute"
            label="Поиск по заказам в маршруте"
            clearable
          ></v-text-field>
          <draggable
            v-model="routeOrders"
            :group="'orders'"
            item-key="pk"
            class="list"
          >
            <template #item="{ element, index }">
              <div v-if="isInFilteredRoute(element)" :key="element.pk">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>{{ element.code }} - {{ element.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ element.addr }}</v-list-item-subtitle>
                    <v-list-item-subtitle>{{ element.plan_time_begin}} - {{ element.plan_time_end}}</v-list-item-subtitle>
                    <v-list-item-subtitle>Вес: {{ element.weight }} кг, Объём: {{ element.volume }} м³</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </div>
            </template>
          </draggable>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</v-dialog>





<v-snackbar
  v-model="snackbar.show"
  :timeout="3000"
  top
  right
  color="success"
>
  {{ snackbar.message }}
  <template v-slot:action>
    <v-btn text @click="snackbar.show = false">
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </template>
</v-snackbar>

 <v-navigation-drawer
  v-model="routeTimelineDrawer"
  right
  temporary
  width="500"
>
  <v-toolbar flat
  >
    <v-toolbar-title class="wrap-text"> {{ selectedRouteForTimeline ? selectedRouteForTimeline.name : '' }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn icon @click="routeTimelineDrawer = false">
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </v-toolbar>

  <v-divider></v-divider>

  <!-- Таймлайн заказов -->
  <v-timeline side="start">
    <v-timeline-item
      v-for="order in routeOrders1"
      :key="order.pk"
      color="primary"
      @click="openEditOrderModal(order)"
      class="cursor-pointer"
    >
      <div>
        <strong>Код клиента:</strong> {{ order.code }}<br>
        <strong>Название:</strong> {{ order.name }}<br>
        <strong>Временное окно:</strong> {{ order.plan_time_begin }} - {{ order.plan_time_end }}<br>
        <strong>Плановое прибытие:</strong> {{ order.plan_time_arrival }}
      </div>
    </v-timeline-item>
  </v-timeline>
</v-navigation-drawer>
</template>




<script>
import axios from "axios";

// Настраиваем Interceptor
axios.interceptors.request.use(
  (config) => {
    const clientId = localStorage.getItem('clientId');
    if (clientId) {
      // Проверяем, является ли URL запроса URL-адресом сервера VROOM
      if (!config.url.startsWith('http://185.155.18.145:15000')) {
        config.headers['Client-Id'] = clientId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import * as turf from '@turf/turf';
import polyline from '@mapbox/polyline';
import moment from 'moment-timezone';
import CustomGanttChart from './CustomGanttChart.vue';
import draggable from 'vuedraggable'
import socket from '@/socket';
import { v4 as uuidv4 } from 'uuid';
//import { useDataStore } from '@/stores/dataStore';
import { kml } from '@tmcw/togeojson'; // Используем togeojson для парсинга KML





// Импорт статических SVG-маркеров
import markerDefault from "@/assets/marker_default.svg?url";
import markerSelect from "@/assets/marker_select.svg?url";
import markerdragorder from "@/assets/marker_hover.svg";

// Импорт склада
import warehouseMarker from '@/assets/warehouse.png'; // Импорт маркера склада
// Получаем базовый URL приложения
const appHost = window.location.origin;

// Формируем абсолютные пути к иконкам
const markerDefaultUrl = `${appHost}${markerDefault}`;
const markerSelectUrl = `${appHost}${markerSelect}`;
const markerdragorderUrl = `${appHost}${markerdragorder}`; // Формируем URL иконки




export default {
  name: 'plan',
  components: {
    CustomGanttChart, 
    draggable,
  },
  data() {
    return {
      orders: [],
      filterDate: this.getCurrentDate(),
      filterDateValue: '',
      filteredOrders: [],
      datemenu: false,
      drag: false,
      currentPage: 1,
      itemsPerPage: 100,
      clientId: '',
      headersorders: [  
        { title: '', value: 'is_select', sortable: false }, // Столбец для чекбоксов
        { title: "Код", value: "code" , sortable: true},
        { title: "Имя", value: "name", sortable: true },
        { title: "Адрес", value: "addr", sortable: true },
        { title: "Старт", value: "plan_time_begin", sortable: true },
        { title: "Конец", value: "plan_time_end" , sortable: true},
        { title: "Контакт", value: "contact_name", sortable: true },
        { title: "Телефон", value: "contact_phone", sortable: true },
        { title: "Комментарий", value: "comment", sortable: true },
        { title: "Приоритет", value: "priority", sortable: true },
        { title: "Вес", value: "weight", sortable: true },
        { title: "Объем", value: "volume" , sortable: true},
        { title: "Тип", value: "worktype_desc", sortable: true },
        { title: "Разгрузка", value: "plan_time_unload" , sortable: true},
        { title: "Бренд", value: "sign" , sortable: true},
        { title: "Примечание", value: "remark" , sortable: true},
        { title: "Зона", value: "zone_name" , sortable: true},
        { title: "Очередь", value: "route_num" , sortable: true},
        { title: "Прибытие", value: "plan_time_arrival", sortable: true },
        { title: "Водитель", value: "driver_name", sortable: true },
        { title: "Требования", value: "skills", sortable: true },
        { title: "Свободное", value: "free" , sortable: true}
      ],
      visibleOrderColumns: [
      ],
      isMenuOpen: false,
      map: null,
      map1: null,
      markers: [],
      markers1: [],
      editOrderDialog: false,
      addOrderDialog: false,
      selectedOrder: {},
      newOrder: {
        code: "",
        name: "",
        addr: "",
        plan_time_begin: "",
        plan_time_end: "",
        plan_lon_x: "",
        plan_lat_y: "",
        contact_name: "",
        contact_phone: "",
        comment: "",
        priority: "",
        weight: "",
        volume: "",
        work_type: "",
        plan_time_unload: "",
        sign: "",
        remark: ""
      },
      selectedMarker: null,
      drawnItems: null,
      isShiftPressed: false,
      planningDialog: false, 
      deleteConfirmationDialog: false,
      deleteRoutesConfirmationDialog: false,
      markerMap: {} ,// Новый объект для маппинга заказов и маркеров
      stocks: [], // Данные по складам
      stockHeaders: [
        { title: 'Название', value: 'name' },
        { title: 'Адрес', value: 'addr' },
        { title: 'Комментарий', value: 'comment' },
        { title: 'Долгота', value: 'lon_x' },
        { title: 'Широта', value: 'lat_y' },
        { title: 'Действия', value: 'actions', sortable: false },
      ],
      currentStock: { name: '', addr: '', comment: '', lon_x: '', lat_y: '' },
      stockFormTitle: 'Добавить новый склад',
      stockFormDialog: false,
      stocksDialog: false,
      agents: [], // Список агентов
      skills: [],
      workTypes: [],
      selectedWorktypeDescription: null, // Выбранный тип работы для фильтрации
      agentHeaders: [
      { title: '', value: 'is_select', sortable: false }, // Столбец для чекбоксов
      { title: 'Имя', value: 'name' , sortable: true  },
      { title: 'Макс. вес', value: 'weight_max' , sortable: true  },
      { title: 'Макс. объем', value: 'volume_max' , sortable: true  },
      { title: 'Маршрут', value: 'routeInfo', sortable: false } // Новый столбец для маршрута
    ],
    agentHeaders1: [
      { title: '', value: 'is_select', sortable: false }, // Столбец для чекбоксов
      { title: 'Имя', value: 'name' , sortable: true  },
      { title: 'Маршрут', value: 'routeInfo', sortable: false } // Новый столбец для маршрута
    ],
    agentHeaders2: [
      { title: '', value: 'is_select', sortable: false }, // Столбец для чекбоксов
      { title: '', value: 'color',   sortable: false },
      { title: 'Имя', value: 'name', sortable: true } // Новый столбец для маршрута
    ],
    agentSearch: '',
      currentAgent: {
        name: '',
        phone: '',
        time_start: '',
        time_end: '',
        start_stock_name: '',
        end_stock_name: '',
        is_active: false,
        weight_max: 0,
        volume_max: 0,
        zones: [],
        skills: [],
      },
      searchQuery: '',
      agentDialog: false,
      allSelected: false, // Флаг для чекбокса выбора всех
      planningDialog: false,  // Диалоговое окно планирования
      planningAgentHeaders: [  // Заголовки для таблицы водителей в окне планирования
      { title: 'Активен', value: 'is_select', sortable: false },
      { title: 'Имя', value: 'name' },
      { title: 'Время с', value: 'time_start' },
      { title: 'Время по', value: 'time_end' },
      { title: 'Макс. вес', value: 'weight_max' },
      { title: 'Макс. объем', value: 'volume_max' },
    ],
    planningParams: {  // Параметры планирования
      unloadTime: 15,  // Время разгрузки
      maxDriverWorkTime: 8,  // Максимальное время работы водителя
      maxRouteLength: 100,  // Максимальная длина маршрута
      startFromWarehouse: true,
      returnToStock: false,  // Возвращаться на склад
      considerZones: false,
      considerSkills: false,
      maxTasks: 25 // Макс кол-во точек
    },
    planningScenario: 'all',  // Сценарий планирования по умолчанию
    allAgentsSelected: false, 
     // Чекбокс для выбора всех агентов
    addAgentDialog: false, // Контроль видимости модального окна
    newAgent: { // Объект для хранения данных нового агента
      name: '',
      code: '',
      phone: '',
      time_start: '',
      time_end: '',
      login: '',
      psw: '',
      is_active: false,
      weight_max: 0,
      volume_max: 0,
      zones: [],
      skills: [],
      // Добавьте другие поля, если необходимо
    },
    activeTab: 0, // Индекс активной вкладки (0 - Заказы, 1 - Маршруты)
    activeTab1: 'planning',
    routes: [], // Массив маршрутов
    routeHeaders: [
      { title: '', value: 'is_select', sortable: false },
      { title: 'Цвет', value: 'color', sortable: false },
      { title: "Код", value: "pk", sortable: true  },
      { title: "Название", value: "name" , sortable: true   },
      { title: "Код маршрута", value: "code" , sortable: true   },
      { title: "Начало", value: "begin_time" , sortable: true   },
      { title: "Окончание", value: "end_time" , sortable: true   },
      { title: "Водитель", value: "driver" , sortable: true   },
      { title: "Вес", value: "route_weight" , sortable: true  },
      { title: "Объем", value: "route_volume" , sortable: true  },
      { title: "Кол-во точек", value: "route_stops" , sortable: true   },
      { title: "Продолжительность маршрута", value: "duration" , sortable: true  },
      { title: "Протяженность маршрута", value: "plan_route_length" , sortable: true  },
      { title: "Стоимость маршрута", value: "cost" , sortable: true  },
      { title: 'Детали', value: 'actions', sortable: false },

      // Добавьте другие необходимые поля
    ],
    selectedRoute: {}, // Для хранения выбранного маршрута
    editRouteDialog: false, // Контроль видимости диалога подтверждения удаления маршрута//
    deleteRouteConfirmationDialog: false,  // Контроль видимости диалога подтверждения удаления маршрута//
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    routePolylines: {},
    freeOrderMarkers: {}, // Маркеры свободных заказов
    routeOrderMarkers: {}, // Маркеры заказов в маршрутах
    isDPressed: false,    // Переменная для отслеживания нажатия клавиши Ctrl
    ganttAgentHeaders: [
        { text: 'Водитель', value: 'name' },
      ],
      orderRouteFilter: 'all', // 'all', 'inRoute', 'notInRoute'
      orderLinkFilter: 'all',  // 'all', 'linked', 'unlinked'
      addressBindingDialog: false,
    currentOrderAddress: '',
    currentOrderId: null,
    geocodedAddresses: [],
    selectedGeocodedAddress: null,
    yandexApiKey: '08c0a618-3988-4bca-99de-ced4110f2c2f',
    ordersToBind: [],         // Массив заказов для привязки адресов
    currentOrderIndex: 0,     // Индекс текущего заказа в массиве ordersToBind
    currentOrderCode: '',
    currentOrderName: '',
    isLoading: false, 
    snackbar: {
      show: false,
      message: '',
    },
    selectedRouteForDriverChange: null, // Выбранный маршрут для смены водителя
    changeDriverDialog: false, // Контролирует видимость диалога смены водителя
    availableDrivers: [], // Список доступных водителей
    filteredDrivers: [],
    confirmDriverChangeDialog: false,
    selectedDriver: null, 
    isLoadingDrivers: false,
    routeNameDialog: false,
    addSelectedOrdersDialog: false,
    routeBuilderDialog: false,
    newRouteName: '',
    selectedOrdersCount: 0,
    availableOrders: [],
    routeOrders: [],
    searchAvailable: '',
    searchRoute: '',
    selectedWarehouse: null,
    isEditingRoute: false,
    currentRoute: null, // Содержит редактируемый маршрут
    zones: [],
    zonesVisible: false,
    zonePolygons: [],
    routeTimelineDrawer: false,
    selectedRouteForTimeline: null,
  
  };
  },

  created() {
    // Генерируем или загружаем clientId при создании компонента
    
    const currentDate = new Date(this.filterDate);
    this.filterDateValue = this.formatDisplayDate(currentDate);

    const savedClientId = localStorage.getItem('clientId');
    if (savedClientId) {
      this.clientId = savedClientId;
    } else {
      this.clientId = uuidv4();
      localStorage.setItem('clientId', this.clientId);
    }
  },
  computed: {


    paginatedOrders() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = this.currentPage * this.itemsPerPage;
    return this.sortedOrders.slice(start, end);
  },
  pageCount() {
    return Math.ceil(this.sortedOrders.length / this.itemsPerPage);
  },

  isPaginationVisible() {
    return this.activeTab === 'orders' || this.activeTab === 'routes';
  },
    isPlanButtonDisabled() {
    return !this.planningParams.startFromWarehouse && !this.planningParams.returnToStock;
  },
    // Вычисляемое свойство для сортировки заказов
    sortedOrders() {
    let orders = this.ordersWithRouteInfo;  // Используем ordersWithRouteInfo как базу

    // Применяем фильтр по маршруту
    if (this.orderRouteFilter === 'inRoute') {
      orders = orders.filter(order => order.free === 0);
    } else if (this.orderRouteFilter === 'notInRoute') {
      orders = orders.filter(order => order.free === 1);
    }

    // Применяем фильтр по привязке
    if (this.orderLinkFilter === 'linked') {
      orders = orders.filter(order => this.isOrderLinked(order));
    } else if (this.orderLinkFilter === 'unlinked') {
      orders = orders.filter(order => !this.isOrderLinked(order));
    }

    // Сортируем заказы
    return orders.slice().sort((a, b) => {
      if (a.is_select && !b.is_select) return -1;
      if (!a.is_select && b.is_select) return 1;
      return 0;
    });
  },

  allRoutesSelected: {
    get() {
      return this.routes.length > 0 && this.routes.every(route => route.is_select);
    },
    set(value) {
      this.routes.forEach(route => {
        route.is_select = value;
        this.updateSelectedRoutes(route);
      });
    }
  },
    


  hasSelectedRoutes() {
      return this.routes.some(route => route.is_select);
    },

  


    computedTableHeight() {
    const windowHeight = window.innerHeight;
    const mapHeight = windowHeight * 0.4; // 40% высоты окна для карты
    const otherHeights = 60 + 10; // Высота кнопок и отступов
    const headerFooterHeight = 150; // Примерная высота заголовка и футера таблицы

    const tableHeight = windowHeight - mapHeight - otherHeights - headerFooterHeight;
    return `${tableHeight}px`;
  },

   // Вычисляемое свойство, добавляющее информацию о маршруте к каждому агенту
 agentsWithRouteInfo() {
      // Сначала добавляем информацию о маршруте к каждому агенту
      const agentsWithRoutes = this.agents.map(agent => {
        // Найти маршрут, связанный с этим агентом
        const route = this.routes.find(route => String(route.pk_agent) === String(agent.pk));

        // Если маршрут найден, добавляем его данные к агенту
        if (route) {
          return {
            ...agent,
            route: route, // Добавляем объект маршрут
            routeInfo: {
              color: route.color,
              route_stops: route.route_stops,
              duration: route.duration,
              plan_route_length: route.plan_route_length,
            },
          };
        }

        // Если маршрут не найден, возвращаем агента без изменений
        return {
          ...agent,
          route: null, // Добавляем поле route, равное null
          routeInfo: null,
        };
      });

      // Затем сортируем так, чтобы агенты с маршрутами были выше
      return agentsWithRoutes.sort((a, b) => {
        // Если у агента `a` есть маршрут, а у агента `b` нет маршрута, `a` должен быть выше
        if (a.routeInfo && !b.routeInfo) return -1;

        // Если у агента `b` есть маршрут, а у агента `a` нет, `b` должен быть выше
        if (!a.routeInfo && b.routeInfo) return 1;

        // Если у обоих агентов есть или нет маршрута, не меняем порядок
        return 0;
      });
    },


    agentsWithRouteInfo1() {
  const result = this.agents
    .map(agent => {
      const agentRoutes = this.routes.filter(route => String(route.pk_agent) === String(agent.pk));
      if (agentRoutes.length > 0) {
        const routeColor = agentRoutes[0].color;  // Предполагаем, что агент связан с одним маршрутом
        return {
          ...agent,
          routes: agentRoutes,
          routeColor,  // Добавляем цвет маршрута
        };
      } else {
        return null;
      }
    })
    .filter(agent => agent !== null);

  console.log('agentsWithRouteInfo1:', result);
  return result;
},

chartStart() {
    const dateStr = this.filterDate
      ? moment(this.filterDate).format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD');

    const startTimes = this.agentsWithRouteInfo1
      .map(agent => agent.time_start ? moment(`${dateStr} ${agent.time_start}`, 'YYYY-MM-DD HH:mm:ss') : null)
      .filter(time => time !== null);

    console.log('Start Times:', startTimes.map(time => time.format()));

    if (startTimes.length === 0) {
      console.warn('No start times found. Using default chartStart.');
      return moment().format('YYYY-MM-DD HH:mm:ss');
    }

    const earliestStartTime = moment.min(startTimes);
    const result = earliestStartTime.format('YYYY-MM-DD HH:mm:ss');
    console.log('chartStart:', result);
    return result;
  },

  chartEnd() {
    const dateStr = this.filterDate
      ? moment(this.filterDate).format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD');

    const endTimes = this.agentsWithRouteInfo1
      .map(agent => agent.time_end ? moment(`${dateStr} ${agent.time_end}`, 'YYYY-MM-DD HH:mm:ss') : null)
      .filter(time => time !== null);

    console.log('End Times:', endTimes.map(time => time.format()));

    if (endTimes.length === 0) {
      console.warn('No end times found. Using default chartEnd.');
      return moment().format('YYYY-MM-DD HH:mm:ss');
    }

    const latestEndTime = moment.max(endTimes);
    const result = latestEndTime.format('YYYY-MM-DD HH:mm:ss');
    console.log('chartEnd:', result);
    return result;
  },
  
    agentBars() {
  const barsByAgent = {};

  this.agentsWithRouteInfo1.forEach(agent => {
    const agentBars = [];
    const dateStr = this.filterDate
      ? moment(this.filterDate).format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD');

    if (agent.time_start && agent.time_end) {
      const start = moment(`${dateStr} ${agent.time_start}`, 'YYYY-MM-DD HH:mm');
      const end = moment(`${dateStr} ${agent.time_end}`, 'YYYY-MM-DD HH:mm');

      agentBars.push({
        startDate: start.format('YYYY-MM-DD HH:mm:ss'),
        endDate: end.format('YYYY-MM-DD HH:mm:ss'),
        ganttBarConfig: {
          id: `working-hours-${agent.pk}`,
          label: '',
          immobile: false,
          style: {
            background: '#d3d3d3',
            opacity: 0.5,
            zIndex: 1,
          },
        },
      });
    }

    barsByAgent[agent.pk] = agentBars;
  });

  this.filteredOrders.forEach(order => {
  let agentId = order.pk_agent;

  // Найдите маршрут, если нет агента напрямую
  if (!agentId && order.pk_route) {
    const route = this.routes.find(r => String(r.pk) === String(order.pk_route));
    if (route) agentId = route.pk_agent;
  }

  if (agentId && barsByAgent[agentId]) {
    if (order.plan_time_arrival && order.plan_time_unload) {
      const arrival = moment(order.plan_time_arrival, 'DD.MM.YYYY, HH:mm');
      const unloadDuration = order.plan_time_unload || 0;
      const end = arrival.clone().add(unloadDuration, 'minutes');

      const routeColor = this.routes.find(r => r.pk_agent === agentId)?.color || '#1976D2';

      console.log('Order ID:', order.pk, 'Route Number:', order.route_num); // Логируем для проверки

      barsByAgent[agentId].push({
        startDate: arrival.format('YYYY-MM-DD HH:mm:ss'),
        endDate: end.format('YYYY-MM-DD HH:mm:ss'),
        order: order, // Добавляем объект заказ
        ganttBarConfig: {
    id: `order-${order.pk}`,
    label: String(order.route_num || 'N/A'),
    style: {
      backgroundColor: routeColor,
    },
    class: 'order-bar', // Добавляем класс
    barStyle: {
      color: 'white',
      fontSize: '10px',
      border: '1px solid black',
      boxSizing: 'border-box', // Добавлено
      zIndex: 2, // Устанавливаем z-index выше
    },
  },
        });
      }
    }
  });

  console.log('Final barsByAgent:', barsByAgent); // Логируем итоговые бары
  return barsByAgent;
},

ordersWithRouteInfo() {
    return this.filteredOrders.map(order => {
      // Найти маршрут, связанный с этим заказом
      const route = this.routes.find(route => String(route.pk) === String(order.pk_route));

      // Если маршрут найден, добавляем его данные к заказу
      if (route) {
        return {
          ...order,
          routeInfo: {
            color: route.color,
          },
        };
      }

      // Если маршрут не найден, возвращаем заказ без изменений
      return {
        ...order,
        routeInfo: null,
      };
    });
  },

  totalOrders() {
    return this.filteredOrders.length;
  },
  freeOrders() {
    return this.filteredOrders.filter(order => order.free === 1).length;
  },
  ordersInRoutes() {
    return this.filteredOrders.filter(order => order.free === 0).length;
  },
  totalWeight() {
    return this.filteredOrders.reduce((sum, order) => sum + order.weight, 0).toFixed(2);
  },
  totalVolume() {
    return this.filteredOrders.reduce((sum, order) => sum + order.volume, 0).toFixed(2);
  },
  totalRoutes() {
    return this.routes.length;
  },
  totalDistance() {
    return this.routes.reduce((sum, route) => sum + parseFloat(route.plan_route_length || 0), 0).toFixed(2);
  },
  totalDuration() {
    // Предположим, что у вас есть поле `duration` в формате "HH:mm:ss"
    const totalSeconds = this.routes.reduce((sum, route) => {
      const parts = route.duration.split(':').map(Number);
      const seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      return sum + seconds;
    }, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes}:${seconds}`;
  },

  displayedOrderHeaders() {
      // Проверяем, что headersorders инициализирован
      if (!this.headersorders || !Array.isArray(this.headersorders)) {
        console.warn('headersorders не инициализирован или не является массивом');
        return [];
      }
      // Фильтруем заголовки на основе visibleOrderColumns
      return this.headersorders.filter(header => this.visibleOrderColumns.includes(header.value));
    },


    filteredAvailableOrders() {
    if (!this.searchAvailable) {
      return this.availableOrders;
    }
    return this.availableOrders.filter(order =>
      order.name.toLowerCase().includes(this.searchAvailable.toLowerCase()) ||
      order.code.toLowerCase().includes(this.searchAvailable.toLowerCase()) ||
      order.addr.toLowerCase().includes(this.searchAvailable.toLowerCase())
    );
  },
  filteredRouteOrders() {
    if (!this.searchRoute) {
      return this.routeOrders;
    }
    return this.routeOrders.filter(order =>
      order.name.toLowerCase().includes(this.searchRoute.toLowerCase()) ||
      order.code.toLowerCase().includes(this.searchRoute.toLowerCase()) ||
      order.addr.toLowerCase().includes(this.searchRoute.toLowerCase())
    );
  },

  totalAvailableWeight() {
    return this.availableOrders.reduce((sum, order) => sum + order.weight, 0).toFixed(2);
  },
  totalAvailableVolume() {
    return this.availableOrders.reduce((sum, order) => sum + order.volume, 0).toFixed(2);
  },
  totalRouteWeight() {
    return this.routeOrders.reduce((sum, order) => sum + order.weight, 0).toFixed(2);
  },
  totalRouteVolume() {
    return this.routeOrders.reduce((sum, order) => sum + order.volume, 0).toFixed(2);
  },

  routeOrders1() {
    if (!this.selectedRouteForTimeline) return [];
    return this.filteredOrders
      .filter(order => String(order.pk_route) === String(this.selectedRouteForTimeline.pk))
      .sort((a, b) => a.route_num - b.route_num); // Сортировка по номеру в маршруте
  },

  //activeMap() {
    //return this.activeTab1 === 'planning' ? this.map : this.map1;
  //}
},

  watch: {
  routeBuilderDialog(newVal, oldVal) {
    if (!newVal) {
      // The dialog was closed
      this.resetRouteBuilderDialogState();
    }
  },

  itemsPerPage(newVal, oldVal) {
    if (newVal !== oldVal) {
      this.$nextTick(() => {
        this.currentPage = 1;
      });
    }
  }
 //   activeTab1(newVal, oldVal) {
   //   this.updateMapContent(newVal, oldVal);
  //  },
},

  methods: {
    applyDateFilter() {
      
      if (this.filterDate) {
        const dateObj = new Date(this.filterDate);
        const year = dateObj.getFullYear();
        const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
        const day = ('0' + dateObj.getDate()).slice(-2);
        const formattedDate = `${year}-${month}-${day}`;
        this.fetchOrders({ date: formattedDate });
      } else {
        this.fetchOrders();
      }
    },

    clearMap() {
    // Удаляем все полилинии маршрутов
    for (const routePk in this.routePolylines) {
      const routeData = this.routePolylines[routePk];
      if (routeData && routeData.polyline) {
        routeData.polyline.destroy();
      }
    }
    this.routePolylines = {};

    // Удаляем маркеры заказов в маршрутах
    for (const routePk in this.routeOrderMarkers) {
      const markers = this.routeOrderMarkers[routePk];
      if (markers) {
        for (const orderPk in markers) {
          const marker = markers[orderPk];
          if (marker) {
            marker.destroy();
          }
        }
      }
    }
    this.routeOrderMarkers = {};

    // Удаляем маркеры свободных заказов
    for (const orderPk in this.freeOrderMarkers) {
      const marker = this.freeOrderMarkers[orderPk];
      if (marker) {
        marker.destroy();
      }
    }
    this.freeOrderMarkers = {};
  },

    fetchOrders(filter = {}, selectedRoutePks = []) {
  return axios
    .get("http://185.155.18.145:15777/api/orders", { params: filter })
    .then(response => {
      if (response.data && Array.isArray(response.data)) {
        this.filteredOrders = response.data.map(order => ({
          ...order,
          is_select: false
        }));
        this.updateMapMarkers();
      } else {
        this.filteredOrders = [];
      }
    })
    .catch(error => {
      console.error("Ошибка при загрузке заказов:", error);
    });
},


toggleRouteFilter(filter) {
      this.orderRouteFilter = this.orderRouteFilter === filter ? 'all' : filter;
    },
    toggleLinkFilter(filter) {
      this.orderLinkFilter = this.orderLinkFilter === filter ? 'all' : filter;
    },
isOrderLinked(order) {
    // Определяем координаты, которые считаются непривязанными
    const defaultCoordinates = [
      [-1, -1],
      [37.618423, 55.751244], // Центр Москвы
    ];
    const lon = parseFloat(order.plan_lon_x);
    const lat = parseFloat(order.plan_lat_y);
    if (!isFinite(lon) || !isFinite(lat)) return false;
    // Проверяем, совпадают ли координаты с непривязанными
    for (const [defaultLon, defaultLat] of defaultCoordinates) {
      if (Math.abs(lon - defaultLon) < 0.0001 && Math.abs(lat - defaultLat) < 0.0001) {
        return false; // Координаты по умолчанию, заказ непривязан
      }
    }
    return true; // Заказ привязан
  },

    // Обновить маркеры заказов на карте
    updateMapMarkers() {
  //console.log('Updating map markers...');
  const mapContainer = this.map.getContainer(); // Получаем контейнер карты
  const ordersToDisplay = this.filteredOrders.filter(order => order.free === 1);
  //console.log(`Orders to display as free: ${ordersToDisplay.map(o => o.pk)}`);

 // Перебираем все заказы, которые должны отображаться как свободные
 ordersToDisplay.forEach(order => {
    if (!order.plan_lon_x || !order.plan_lat_y) {
      console.warn(`Пропущены координаты для заказа: ${order.pk}`);
      return;
    }

    const pkString = String(order.pk);

    // Если маркер уже существует, обновляем его иконку
    if (this.freeOrderMarkers[pkString]) {
      const marker = this.freeOrderMarkers[pkString];
      const newIconUrl = order.is_select ? markerSelectUrl : markerDefaultUrl;
      marker.setIcon({
        icon: newIconUrl,
        size: [30, 30],
        zIndex: 10, // Устанавливаем более высокий zIndex для маркеров
      });
      console.log(`Updated marker for free order ${order.pk}`);
    } else {
      // Создаём новый маркер только для свободных заказов
      const iconUrl = order.is_select ? markerSelectUrl : markerDefaultUrl;
      const marker = new mapgl.Marker(this.map, {
        coordinates: [order.plan_lon_x, order.plan_lat_y],
        icon: iconUrl,
        size: [30, 30],
        zIndex: 10, // Устанавливаем более высокий zIndex для маркеров
      });
      

      let dragging = false;
      let initialCoordinates = [order.plan_lon_x, order.plan_lat_y]; // Запоминаем начальные координаты
      let placeholderMarker = null; // Иконка, которая появляется на месте старого маркера
      let highlightedRoutePk = null;

      

      const onMouseMove = (event) => {
    if (!dragging) return;

    const rect = this.map.getContainer().getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;
    const newCoordinates = this.map.unproject([relativeX, relativeY]);

    if (newCoordinates && newCoordinates.length === 2) {
      marker.setCoordinates(newCoordinates);
    }
  
  
   // Проверяем пересечение маркера с другим маршрутом
   const routeUnderCursor = this.getRouteUnderCursor(event);

// Если курсор над полилинией другого маршрута, подсвечиваем его
if (routeUnderCursor && highlightedRoutePk !== routeUnderCursor.pk) {
  // Убираем подсветку с предыдущего маршрута
  if (highlightedRoutePk) {
    this.updateRoutePolylineStyle(highlightedRoutePk, { width: 2 });
  }

} else if (!routeUnderCursor && highlightedRoutePk) {
  // Убираем подсветку, если ни один маршрут не под курсором
  this.updateRoutePolylineStyle(highlightedRoutePk, { width: 2 });
  highlightedRoutePk = null;
}
};

 // Начало перетаскивания
 marker.on('mousedown', (event) => {
    dragging = true;
    this.map.setOption('disableDragging', true); // Отключаем перетаскивание карты

    // Hide tooltip if visible
    if (marker.popupHtml) {
          this.hidePopup(marker.popupHtml);
          clearTimeout(popupTimeout);
        }

        // Создаём маркер-заполнитель на месте старого маркера
        placeholderMarker = new mapgl.Marker(this.map, {
          coordinates: initialCoordinates,
          icon: markerdragorderUrl, // Иконка для заполнителя
          size: [30, 30],
          zIndex: 10, // Устанавливаем более высокий zIndex для маркеров
        });

         // Добавляем обработчики событий
    document.addEventListener('mousemove', onMouseMove);

  });

  // Завершение перетаскивания маркера
  document.addEventListener('mouseup', async (event) => {
    if (dragging) {
      dragging = false;
      this.map.setOption('disableDragging', false); // Включаем обратно перетаскивание карты


      // Hide tooltip if visible
       if (marker.popupHtml) {
            this.hidePopup(marker.popupHtml);
            clearTimeout(popupTimeout);
          }

        // Удаляем плейсхолдер
        if (placeholderMarker) {
        placeholderMarker.destroy();
        placeholderMarker = null;
      }

      // Определяем, на какой маршрут мы перетащили заказ
      const targetRoute = this.getRouteUnderCursor(event);

      if (!targetRoute) {
        console.log('Маркер отпущен не над маршрутом.');
        // Если ни один маршрут не был выбран, возвращаем маркер на исходные координаты
        marker.setCoordinates(initialCoordinates);
        return; // Прерываем выполнение функции, если не найден целевой маршрут
      }

      console.log(`Маркер отпущен над маршрутом: ${targetRoute.name}`);

        // Проверяем вместимость автомобиля
        const agent = this.agents.find(a => String(a.pk) === String(targetRoute.pk_agent));
        const routeOrders = this.filteredOrders.filter(o => String(o.pk_route) === String(targetRoute.pk));

        if (this.canAddOrderToRoute(order, routeOrders, agent)) {
          console.log('Заказ помещается в маршрут. Переносим заказ.');
          // Добавляем заказ в маршрут
          //await this.addOrderToRoute(order, targetRoute);

          // Пересчитываем маршрут
          await this.recalculateRoute(targetRoute, [...routeOrders, order]);

            // Remove and display routes on map
        this.removeRouteOnMap(targetRoute);
        this.displayRouteOnMap(targetRoute);

              // Update markers of free orders
        this.updateMapMarkers();
        this.applyDateFilter();
        } else {
          alert('Заказ не может быть добавлен в маршрут из-за ограничений по весу или объёму.');
          // Возвращаем маркер на исходные координаты
          marker.setCoordinates(initialCoordinates);
        }
        document.removeEventListener('mousemove', onMouseMove);
    }
  });

      let popupHtml = null; // Tooltip создаётся динамически при наведении
      let popupTimeout;

      marker.on("mouseover", (event) => {
  if (!marker.popupHtml) {
    // The tooltip doesn't exist; create it
    marker.popupHtml = this.createOrderPopupHtml(order);
    mapContainer.appendChild(marker.popupHtml);
  }
  this.showPopup(event, marker.popupHtml, this.map);
});

marker.on("mouseout", () => {
  if (marker.popupHtml) {
    this.hidePopup(marker.popupHtml);
  }
});

      marker.on('click', () => {
        order.is_select = !order.is_select;
        this.updateSingleMarker(order);
        this.onSelectChange(order);  // Обновляем только один маркер
        if (popupHtml) {
          this.hidePopup(popupHtml);
        }
        clearTimeout(popupTimeout);
      });

    this.freeOrderMarkers[pkString] = marker; // Сохраняем маркер
    //console.log(`Created new free marker for order ${order.pk}`);
    }
  });

  


  // Удаляем маркеры для заказов, которые были удалены или больше не должны отображаться
  Object.keys(this.freeOrderMarkers).forEach(pk => {
  const orderStillDisplayed = ordersToDisplay.some(order => String(order.pk) === pk);
  if (!orderStillDisplayed) {
    const marker = this.freeOrderMarkers[pk];

    // Remove tooltip if it exists
    if (marker.popupHtml) {
      if (marker.popupHtml.parentNode) {
        marker.popupHtml.parentNode.removeChild(marker.popupHtml);
      }
      marker.popupHtml = null;
    }

    // Remove event listeners
    marker.off('mouseover');
    marker.off('mouseout');
    marker.off('mousedown');
    // If you added other event listeners, remove them here

    marker.destroy();
    delete this.freeOrderMarkers[pk];
    
    console.log(`Destroyed free marker for order ${pk}`);
  }
});
},

/**
 * Обновляет иконку маркера для конкретного заказа.
 * @param {Object} order - Заказ, для которого обновляется маркер.
 */
updateSingleMarker(order) {
  const pkString = String(order.pk);
  const existingMarker = this.freeOrderMarkers[pkString];

  if (existingMarker) {
    // Определяем новую иконку
    const newIconUrl = order.is_select ? markerSelectUrl : markerDefaultUrl;

    if (!newIconUrl) {
      console.error('Иконка не найдена для маркера:', order.pk);
      return;
    }

    existingMarker.setIcon({
      icon: newIconUrl,
      size: [30, 30], // Укажите размер, если необходимо
      zIndex: 10, // Устанавливаем более высокий zIndex для маркеров
      // Вы можете добавить другие параметры, такие как anchor
    });

    // Обновляем состояние маркера на карте
    existingMarker.show(); // Если маркер был скрыт
  }
},


/**
 * Создаёт HTML для попапа заказа (tooltip).
 * @param {Object} order - Заказ, для которого создаётся попап.
 */
createOrderPopupHtml(order) {
  const popupHtml = document.createElement('div');
  popupHtml.className = 'popup';
  popupHtml.innerHTML = `
    <div class="popup-content">
      <b>Заказ:</b> ${order.name}<br>
      <b>Адрес:</b> ${order.addr}<br>
      <b>Интервал:</b> ${order.plan_time_begin} - ${order.plan_time_end}
    </div>
    <div class="popup-tip"></div>`;
  popupHtml.style.display = 'none';
  return popupHtml;
},

/**
 * Показывает tooltip на карте.
 * @param {Object} event - Событие мыши.
 * @param {HTMLElement} popupHtml - Элемент попапа.
 */
 showPopup(event, popupHtml, map) {
  if (!popupHtml) return;
  const mapContainer = map.getContainer();
  const mapRect = mapContainer.getBoundingClientRect();
  const x = event.originalEvent.clientX - mapRect.left;
  const y = event.originalEvent.clientY - mapRect.top;

  popupHtml.style.display = 'block';
  popupHtml.style.position = 'absolute';
  popupHtml.style.left = `${x + 10}px`;
  popupHtml.style.top = `${y - 50}px`;
},

/**
 * Скрывает tooltip на карте.
 * @param {HTMLElement} popupHtml - Элемент попапа.
 */
hidePopup(popupHtml) {
  if (!popupHtml) return; 
  popupHtml.style.display = 'none';
},

onSelectChange(order) {
  console.log(`Order ${order.pk} selection status:`, order.is_select);
  if (order.free === 1) {
    // Это свободный заказ
    this.updateSingleMarker(order);
  } else {
    // Это заказ в маршруте
    this.updateRouteOrderMarkerSelection(order);
  }
},


updateRouteOrderMarkerSelection(order) {
  const routePk = order.pk_route;
  const markers = this.routeOrderMarkers[routePk];

  if (markers && markers[order.pk]) {
    const marker = markers[order.pk];
    const routeColor = marker.routeColor;
    const markerRoutePk = marker.routePk; // Переименовали переменную для маршрута маркера

    // Уничтожаем существующий маркер
    marker.destroy();

    // Определяем тип маркера в зависимости от состояния выделения
    const markerType = order.is_select ? 'selected' : 'default';

    // Создаём новый маркер с обновлённым состоянием
    const newMarker = this.createOrderMarker(order, routeColor, markerType, markerRoutePk); // Используем правильное имя переменной
    newMarker.setCoordinates([order.plan_lon_x, order.plan_lat_y]); // Устанавливаем координаты

    // Обновляем маркер в коллекции
    this.routeOrderMarkers[routePk][order.pk] = newMarker; // Используем `routePk`, а не `markerRoutePk`

    // Включаем перетаскивание для нового маркера
    this.enableMarkerDrag(newMarker, order, [order.plan_lon_x, order.plan_lat_y], routeColor);
  }
},


initMap() {
    // Проверяем, существует ли элемент с id="map"
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Элемент с id "map" не найден в DOM.');
      return;
    }
  this.map = new mapgl.Map("map", {
    center: [37.618423, 55.751244], // Москва
    key: "88007df7-b47c-4291-8775-b3b6c9c31782",
    style: "625ac99b-0609-489e-adc8-d41792918688",
    styleZoom: 12, // Вставьте свой ключ API от 2GIS
    disableRotationByUserInteraction: true,
    disableHidingPois: true
  });
  this.map.on('contextmenu', () => {
    // Сбрасываем выделение для всех заказов
    this.filteredOrders.forEach(order => {
      if (order.is_select) {
        order.is_select = false;
        this.updateSingleMarker(order); // Обновляем каждый маркер
      }
    });
    this.resetSelectedMarkers(); // Сбрасываем выделенные маркеры
  });
  this.initDrawingTool();
  this.fetchStocks(); // Загружаем склады и показываем маркеры
},



// Функция сброса всех выделенных маркеров
resetSelectedMarkers() {
  this.filteredOrders.forEach(order => {
    const markers = this.routeOrderMarkers[order.pk_route]; // Используем order.pk_route вместо route.pk
    if (markers && markers[order.pk]) {
      const marker = markers[order.pk];

      const routeColor = marker.routeColor;
      const routePk = marker.routePk;

      // Уничтожаем существующий маркер
      marker.destroy();

      // Определяем тип маркера в зависимости от состояния выделения
      const markerType = order.is_select ? 'selected' : 'default';

      // Создаём новый маркер с обновлённым состоянием
      const newMarker = this.createOrderMarker(order, routeColor, markerType, routePk);
      newMarker.setCoordinates([order.plan_lon_x, order.plan_lat_y]);

      // Обновляем маркер в коллекции
      this.routeOrderMarkers[order.pk_route][order.pk] = newMarker; // Используем order.pk_route
    }
  });
},
    initDrawingTool() {
      this.drawing = false;
      this.coordinates = [];
      this.polygon = null;
      this.isMouseDown = false;

      const mapContainer = this.map.getContainer();

      mapContainer.addEventListener('mousedown', (ev) => {
        if (this.isShiftPressed && ev.button === 0) {
          ev.preventDefault();
          ev.stopPropagation();
          this.isMouseDown = true;
          this.coordinates = [];
          this.startDrawing();

          const rect = mapContainer.getBoundingClientRect();
          const x = ev.clientX - rect.left;
          const y = ev.clientY - rect.top;
          const lngLat = this.map.unproject([x, y]);
          this.coordinates.push([lngLat[0], lngLat[1]]);
        }
      });

      mapContainer.addEventListener('mousemove', (ev) => {
        if (this.drawing && this.isMouseDown) {
          ev.preventDefault();
          ev.stopPropagation();
          const rect = mapContainer.getBoundingClientRect();
          const x = ev.clientX - rect.left;
          const y = ev.clientY - rect.top;
          const lngLat = this.map.unproject([x, y]);
          this.coordinates.push([lngLat[0], lngLat[1]]);
          this.updatePolygon();
        }
      });

      mapContainer.addEventListener('mouseup', (ev) => {
        if (this.drawing && this.isMouseDown) {
          ev.preventDefault();
          ev.stopPropagation();
          this.isMouseDown = false;
          if (!this.isShiftPressed) {
            this.finishDrawing();
          }
        }
      });

      mapContainer.addEventListener('mousedown', (ev) => {
        ev.preventDefault();
      });

      this.map.on('contextmenu', () => {
        this.filteredOrders.forEach(order => order.is_select = false);
        this.updateMapMarkers();
        this.resetSelectedMarkers();
      });
    },

    startDrawing() {
      this.drawing = true;
      if (this.polygon) {
        this.polygon.destroy();
        this.polygon = null;
      }
      this.map.getContainer().classList.add('drawing-cursor');
    },

    finishDrawing() {
      this.drawing = false;
      this.isMouseDown = false;
      this.map.getContainer().classList.remove('drawing-cursor');
      this.selectMarkersWithinPolygon();
      this.polygon.destroy();
    },

    updatePolygon() {
      if (this.polygon) {
        this.polygon.destroy();
      }

      if (this.coordinates.length > 2) {
        this.polygon = new mapgl.Polygon(this.map, {
          coordinates: [this.coordinates],
          color: 'rgba(255, 0, 0, 0.3)',
          strokeColor: '#ff0000',
          strokeWidth: 2,
          interactive: false,
        });
      }
    },

    selectMarkersWithinPolygon() {
  if (!this.coordinates || this.coordinates.length < 3) {
    return;
  }

  const polygon = turf.polygon([[...this.coordinates, this.coordinates[0]]]);

  // Process free order markers
  for (const orderId in this.freeOrderMarkers) {
    const order = this.filteredOrders.find(o => o.pk === Number(orderId));
    if (order) {
      const point = turf.point([order.plan_lon_x, order.plan_lat_y]);
      const isInside = turf.booleanPointInPolygon(point, polygon);

      if (order.is_select !== isInside) {
        order.is_select = isInside;
        this.updateSingleMarker(order);
      }
    }
  }

  // Process route order markers for routes that are selected (visible)
  for (const routePk in this.routeOrderMarkers) {
    const route = this.routes.find(r => String(r.pk) === String(routePk));
    if (route && route.is_select) { // Assuming you have 'is_select' property on your routes
      const markers = this.routeOrderMarkers[routePk];
      for (const orderId in markers) {
        const order = this.filteredOrders.find(o => o.pk === Number(orderId));
        if (order) {
          const point = turf.point([order.plan_lon_x, order.plan_lat_y]);
          const isInside = turf.booleanPointInPolygon(point, polygon);

          if (order.is_select !== isInside) {
            order.is_select = isInside;
            this.updateRouteOrderMarkerSelection(order);
          }
        }
      }
    }
  }
},

    resetDrawing() {
      this.drawing = false;
      this.isMouseDown = false;
      this.coordinates = [];
      this.map.getContainer().classList.remove('drawing-cursor');
      this.filteredOrders.forEach(order => order.is_select = false);
      this.updateMapMarkers();
    },

    openAddOrderModal() {
      this.newOrder = {
        code: "",
        name: "",
        addr: "",
        plan_time_begin: "",
        plan_time_end: "",
        plan_lon_x: "",
        plan_lat_y: "",
        contact_name: "",
        contact_phone: "",
        comment: "",
        priority: "",
        weight: "",
        volume: "",
        work_type: "",
        plan_time_unload: "",
        sign: "",
        remark: "",
        skills:[],
      };
      this.addOrderDialog = true;
    },

    async submitNewOrder() {
      try {
        await axios.post("http://185.155.18.145:15777/api/orders", this.newOrder);
        this.addOrderDialog = false;
        this.applyDateFilter();
      } catch (error) {
        console.error("Ошибка при добавлении заказа", error);
      }
    },

    openEditOrderModal(item) {
  console.log('openEditOrderModal called with item:', item);
  this.selectedOrder = { ...item };
  console.log('Selected Order:', this.selectedOrder);

  if (!this.selectedOrder.skills) {
    this.selectedOrder.skills = [];
  }

  // Преобразуем work_type в строку
  if (this.selectedOrder.work_type != null) {
    this.selectedOrder.work_type = String(this.selectedOrder.work_type);
  } else {
    this.selectedOrder.work_type = null;
  }

  console.log('selectedOrder.work_type:', this.selectedOrder.work_type);

  this.editOrderDialog = true;
  console.log('editOrderDialog:', this.editOrderDialog);
},

async submitEditOrder() {
  try {
    // Создаём объект без полей, которые не нужно отправлять
    const { free, to_agent_gid, route_gid, ...orderToUpdate } = this.selectedOrder;

    // Убедимся, что skills это массив
    if (!Array.isArray(orderToUpdate.skills)) {
      orderToUpdate.skills = [];
    }

    await axios.put(`http://185.155.18.145:15777/api/orders/${orderToUpdate.pk}`, orderToUpdate);
    this.editOrderDialog = false;
    this.applyDateFilter();
  } catch (error) {
    console.error("Ошибка при редактировании заказа", error);
  }
},

    confirmDeleteOrder() {
      this.deleteConfirmationDialog = true;
    },

    async deleteOrder(pk) {
      if (!pk) {
        console.error("Ошибка: код заказа не определён");
        return;
      }
      try {
        await axios.delete(`http://185.155.18.145:15777/api/orders/${pk}`);
        this.editOrderDialog = false;
        this.deleteConfirmationDialog = false;
        this.applyDateFilter();
      } catch (error) {
        console.error("Ошибка при удалении заказа", error);
      }
    },

    onGlobalKeyDown(event) {
    if (event.key === 'Shift') {
      this.isShiftPressed = true;
      this.map.getContainer().classList.add('drawing-cursor');
    }
    if (event.key === 'd' || event.key === 'D' || event.key === 'в' || event.key === 'В') {
      this.isDPressed = true;
      this.map.getContainer().classList.add('delete-cursor');
    }
  },

  onGlobalKeyUp(event) {
    if (event.key === 'Shift') {
      this.isShiftPressed = false;
      this.map.getContainer().classList.remove('drawing-cursor');
      if (this.drawing) {
        this.finishDrawing();
      }
    }
    if (event.key === 'd' || event.key === 'D' || event.key === 'в' || event.key === 'В') {
      this.isDPressed = false;
      this.map.getContainer().classList.remove('delete-cursor');
    }
  },
    // Открыть диалог для управления складами
    openStocksDialog() {
      this.stocksDialog = true;
    },

    // Открыть форму добавления нового склада
    openAddStockModal() {
      this.stockFormTitle = 'Добавить новый склад';
      this.currentStock = { name: '', addr: '', comment: '', lon_x: '', lat_y: '' };
      this.stockFormDialog = true;
    },

    // Открыть форму редактирования склада
    editStock(stock) {
      this.stockFormTitle = 'Редактировать склад';
      this.currentStock = { ...stock };
      this.stockFormDialog = true;
    },

    // Отправить форму добавления/редактирования склада
    async submitStockForm() {
      try {
        if (this.currentStock.gid) {
          // Обновляем склад
          await axios.put(`http://185.155.18.145:15777/api/stocks/${this.currentStock.gid}`, this.currentStock);
        } else {
          // Добавляем новый склад
          await axios.post('http://185.155.18.145:15777/api/stocks', this.currentStock);
        }
        this.fetchStocks();
        this.stockFormDialog = false;
      } catch (error) {
        console.error('Ошибка при сохранении склада:', error);
      }
    },

    // Удалить склад
    async deleteStock(gid) {
      try {
        await axios.delete(`http://185.155.18.145:15777/api/stocks/${gid}`);
        this.fetchStocks();
      } catch (error) {
        console.error('Ошибка при удалении склада:', error);
      }
    },

    // Получить данные складов
    async fetchStocks() {
      try {
        const response = await axios.get('http://185.155.18.145:15777/api/stocks');
        this.stocks = response.data;
        this.updateWarehouseMarkers();
      } catch (error) {
        console.error('Ошибка при загрузке складов:', error);
      }
    },

   // Обновить маркеры складов на карте
   updateWarehouseMarkers() {
  this.clearMarkers(); // Oчищаем предыдущие маркеры
  this.stocks.forEach(stock => {
    const marker = new mapgl.Marker(this.map, {
      coordinates: [stock.lon_x, stock.lat_y],
      icon: warehouseMarker,
    });

    // Создаем элемент тултипа
    const popupHtml = this.createStockPopupHtml(stock);
    this.map.getContainer().appendChild(popupHtml); // Append to the correct map container

    let popupTimeout;

    // Показать тултип при наведении
    marker.on("mouseover", (event) => {
      clearTimeout(popupTimeout);
      this.showPopup(event, popupHtml, this.map); // Pass this.map
    });

    // Скрыть тултип при уходе курсора
    marker.on("mouseout", () => {
      popupTimeout = setTimeout(() => {
        this.hidePopup(popupHtml);
      }, 500);
    });

    // Обработка событий тултипа
    popupHtml.addEventListener("mouseenter", () => {
      clearTimeout(popupTimeout);
    });

    popupHtml.addEventListener("mouseleave", () => {
      popupTimeout = setTimeout(() => {
        this.hidePopup(popupHtml);
      }, 500);
    });

    this.markers.push(marker); // Сохраняем маркер
  });
},

    // Создаем HTML для тултипа
   // Функция для создания попапа склада
   createStockPopupHtml(stock) {
    const popupHtml = document.createElement('div');
    popupHtml.className = 'popup';
    popupHtml.innerHTML = `
      <div class="popup-content">
        <b>Склад:</b> ${stock.name}<br>
        <b>Адрес:</b> ${stock.addr}
      </div>
      <div class="popup-tip"></div>`;
    popupHtml.style.display = 'none';
    return popupHtml;
  },

     // Очистить все маркеры с карты
     clearMarkers() {
      this.markers.forEach(marker => marker.destroy());
      this.markers = []; // Очищаем массив маркеров
    },
async fetchAgents() {
  try {
    const response = await axios.get('http://185.155.18.145:15777/api/agents');
    this.agents = response.data.map(agent => ({
      ...agent,
      is_select: agent.is_active, // Поле для чекбокса активности
      skills: agent.skills || [],
      zones: agent.zones || [],
    }));
  } catch (error) {
    console.error('Ошибка при загрузке агентов:', error);
  }
},
    // Открыть модалку для редактирования агента
    openEditAgentModal(agent) {
  this.currentAgent = { ...agent };

  // Загрузите зоны агента
  axios.get(`http://185.155.18.145:15777/api/agents/${agent.pk}/zones`)
    .then(response => {
      this.currentAgent.zones = response.data.map(zone => zone.pk);
    })
    .catch(error => {
      console.error('Ошибка при загрузке зон агента:', error);
    });

  // Загрузите навыки агента
  axios.get(`http://185.155.18.145:15777/api/agents/${agent.pk}/skills`)
    .then(response => {
      this.currentAgent.skills = response.data.map(skill => skill.pk);
    })
    .catch(error => {
      console.error('Ошибка при загрузке навыков агента:', error);
    });

  this.agentDialog = true;
},

    // Метод для переключения выбора всех агентов
    toggleSelectAll() {
    this.allSelected = !this.allSelected;
    this.agents.forEach(agent => {
      agent.is_select = this.allSelected;
    });
  },

  // Метод для обработки изменения состояния отдельного агента
  onSelectAgentChange(agent) {
    agent.is_active = agent.is_select;
    this.updateAgent(agent);

    // Проверяем, если хотя бы один агент не выбран, сбрасываем allSelected
    if (!agent.is_select) {
      this.allSelected = false;
    }

    // Если все агенты выбраны, устанавливаем allSelected
    if (this.agents.every(agent => agent.is_select)) {
      this.allSelected = true;
    }
  },

    // Отправить данные формы для сохранения агента
    async submitAgentForm() {
  try {
    // Сохранение основных данных агента
    await axios.put(`http://185.155.18.145:15777/api/agents/${this.currentAgent.pk}`, this.currentAgent);

    // Сохранение зон агента
    await axios.post(`http://185.155.18.145:15777/api/agents/${this.currentAgent.pk}/zones`, {
      zones: this.currentAgent.zones,
    });

    // Сохранение навыков агента
    await axios.post(`http://185.155.18.145:15777/api/agents/${this.currentAgent.pk}/skills`, {
      skills: this.currentAgent.skills,
    });

    this.agentDialog = false;
    this.fetchAgents(); // Обновить список агентов
  } catch (error) {
    console.error('Ошибка при сохранении агента или его зон/навыков:', error);
  }
},

    // Обновить агента
    async updateAgent(agent) {
  try {
    // Обновляем основные данные агента
    await axios.put(`http://185.155.18.145:15777/api/agents/${agent.pk}`, agent);

    // Сохранение зон агента
    await axios.post(`http://185.155.18.145:15777/api/agents/${agent.pk}/zones`, {
      zones: agent.zones,
    });

    // Сохранение навыков агента
    await axios.post(`http://185.155.18.145:15777/api/agents/${agent.pk}/skills`, {
      skills: agent.skills,
    });
  } catch (error) {
    console.error('Ошибка при обновлении агента или его зон/навыков:', error);
  }
},
    openPlanningDialog() {
      // Открыть модальное окно планирования
      this.planningDialog = true;
    },
    closePlanningDialog() {
      // Закрыть модальное окно планирования
      this.planningDialog = false;
    },
    toggleSelectAllAgents() {
      // Логика выбора всех агентов
      this.allAgentsSelected = !this.allAgentsSelected;
      this.agents.forEach(agent => {
        agent.is_select = this.allAgentsSelected;
      });
    },

    async deleteAllRoutes() {
  const pksToDelete = this.routes.map(route => route.pk);

  if (pksToDelete.length === 0) {
    this.showSnackbar("Нет маршрутов для удаления.");
    return;
  }

  try {
    await this.executeWithLoading(async () => {
      console.log(`Начинаем массовое удаление ${pksToDelete.length} маршрутов.`);

      // Отправляем запрос на массовое удаление
      const response = await axios.delete('http://185.155.18.145:15777/api/routesbatch/', {
        data: { pks: pksToDelete },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Массовое удаление прошло успешно:', response.data);

      // Очищаем локальный массив маршрутов
      this.routes = [];

      // Очищаем полилинии маршрутов с карты
      this.clearMap();

      // Обновляем фильтр по дате для отражения изменений
      //await this.applyDateFilter();

      // Отображаем уведомление о успешном удалении
      this.showSnackbar('Все маршруты успешно удалены.');
    });
  } catch (error) {
    console.error("Ошибка при массовом удалении маршрутов:", error);
    alert('Произошла ошибка при удалении маршрутов. Проверьте консоль для деталей.');
  }
},
async planRoutes() {
  // Проверка на наличие хотя бы одного из start или end
  if (!this.planningParams.startFromWarehouse && !this.planningParams.returnToStock) {
    this.showSnackbar('Необходимо выбрать хотя бы "Начинать со склада" или "Возвращаться на склад".');
    return;
  }
  try {
    await this.executeWithLoading(async () => {
      let selectedAgents = this.agents.filter(agent => agent.is_select);

      // Проверка, выбраны ли агенты
      if (selectedAgents.length === 0) {
        alert('Пожалуйста, выберите хотя бы одного водителя для планирования.');
        throw new Error('Не выбраны водители');
      }

      let selectedOrders = this.filteredOrders.filter(order => order.is_select);
      let ordersToPlan = selectedOrders.length > 0 ? selectedOrders : this.filteredOrders;

      // Обработка сценариев планирования
      if (this.planningScenario === 'keepExistingWithNew') {
        // Просто сохраняем существующие маршруты без изменений
        this.showSnackbar('Существующие маршруты сохранены без изменений.');
        return;
      }

      if (this.planningScenario === 'keepExistingNoNew') {
        // Получаем список занятых агентов из agentsWithRouteInfo1
        const busyAgentIds = this.agentsWithRouteInfo1.map(agent => agent.pk);
        selectedAgents = selectedAgents.filter(agent => !busyAgentIds.includes(agent.pk));

        // Исключаем заказы, которые уже в маршрутах (free === 0)
        ordersToPlan = ordersToPlan.filter(order => order.free !== 0);

        // Если после фильтрации агентов список пуст, показываем уведомление
        if (selectedAgents.length === 0) {
          this.showSnackbar('Нет доступных водителей для добавления новых заказов.');
          return;
        }
      }

      if (this.planningScenario === 'all') {
        // Удаляем все существующие маршруты
        await this.deleteAllRoutes();

        // После удаления маршрутов, обновляем списки агентов и заказов
        selectedAgents = this.agents.filter(agent => agent.is_select);
        selectedOrders = this.filteredOrders.filter(order => order.is_select);
        ordersToPlan = selectedOrders.length > 0 ? selectedOrders : this.filteredOrders;
      }

      // Проверка наличия заказов
      if (ordersToPlan.length === 0) {
        alert('Нет заказов для планирования.');
        throw new Error('Нет заказов для планирования');
      }

      // Генерация JSON объекта для VROOM
      const jsonData = this.generatePlanningJson(selectedAgents, ordersToPlan, this.planningParams);

      // Проверка, был ли JSON успешно сгенерирован
      if (!jsonData) {
        throw new Error('Ошибка при генерации данных для планирования');
      }

      console.log("Сформированный JSON для VROOM:", JSON.stringify(jsonData, null, 2));

      // Отправка JSON на сервер VROOM
      await this.sendPlanningRequest(jsonData);

      // Информирование пользователя о количестве непривязанных заказов
      if (jsonData.unlinkedOrdersCount > 0) {
        this.showSnackbar(`${jsonData.unlinkedOrdersCount} заказ(ов) не были спланированы из-за некорректной привязки.`);
      } else {
        this.showSnackbar('Маршруты успешно спланированы.');
      }

      // Обновляем данные после планирования
      await this.applyDateFilter();

      // Закрываем диалог планирования
      this.planningDialog = false;
    });
  } catch (error) {
    console.error('Ошибка при планировании маршрутов:', error);
    this.showSnackbar('Ошибка при планировании маршрутов');
    // Диалоговое окно остаётся открытым
  }
},


   /**
 * Конвертирует дату и время заказа из формата "dd.mm.yyyy, hh:mm" в Unix timestamp
 * @param {String} dateTime - Строка даты и времени, например "29.08.2023, 08:00"
 * @returns {Number|null} Unix timestamp или null при ошибке
 */
convertOrderToUnix(dateTime) {
  if (!dateTime) return null;

  const [datePart, timePart] = dateTime.split(', ');
  if (!datePart || !timePart) return null;

  const [day, month, year] = datePart.split('.');
  const [hours, minutes] = timePart.split(':');

  // Создаем объект даты в формате "yyyy-mm-ddThh:mm:ss"
  const isoString = `${year}-${month}-${day}T${hours}:${minutes}:00`;
  const date = new Date(isoString);

  // Проверяем корректность даты
  if (isNaN(date.getTime())) {
    console.error(`Некорректная дата: ${isoString}`);
    return null;
  }

  return Math.floor(date.getTime() / 1000);
},

  /**
   * Конвертирует дату и время в Unix формат
   * @param {String} dateTime - Строка даты и времени, например "2024-09-23 04:00:00"
   * @returns {Number} Unix timestamp
   */
   convertVehicleToUnix(dateTime) {
    return Math.floor(new Date(dateTime).getTime() / 1000);
  },


  /**
   * Генерирует JSON объект для VROOM
   * @param {Array} agents - Список агентов (водителей)
   * @param {Array} orders - Список заказов
   * @param {Object} planningParams - Параметры планирования
   * @returns {Object} JSON объект для VROOM
   */
   generatePlanningJson(agents, orders, planningParams) {
  // Проверка на наличие хотя бы одного из start или end
  if (!planningParams.startFromWarehouse && !planningParams.returnToStock) {
    this.showSnackbar('Необходимо выбрать хотя бы "Начинать со склада" или "Возвращаться на склад".');
    return null; // Прерываем генерацию JSON
  }

  // Фильтруем непривязанные заказы
  const unlinkedOrders = orders.filter(order => !this.isOrderLinked(order));
  const linkedOrders = orders.filter(order => this.isOrderLinked(order));

  // Сохраняем количество непривязанных заказов для последующего использования
  const unlinkedOrdersCount = unlinkedOrders.length;

  // Если нет привязанных заказов, сообщаем пользователю и прекращаем генерацию JSON
  if (linkedOrders.length === 0) {
    this.showSnackbar('Нет заказов с корректной привязкой для планирования.');
    return null;
  }

  const allZoneIds = this.zones.map(zone => zone.pk); // Получаем все доступные зоны

  const vehicles = agents.map(agent => {
    const startCoords = [agent.start_x_stock, agent.start_y_stock];
    const endCoords = [agent.end_x_stock, agent.end_y_stock];

    const timeWindowStart = this.convertVehicleToUnix(this.filterDate + ' ' + agent.time_start);
    const timeWindowEnd = this.convertVehicleToUnix(this.filterDate + ' ' + agent.time_end);

    // Формируем массив skills для транспортного средства
    let vehicleSkills = [];

    // Обработка зон агента
    if (planningParams.considerZones) {
      if (Array.isArray(agent.zones) && agent.zones.length > 0) {
        vehicleSkills.push(...agent.zones);
      } else {
        // Если зон нет, добавляем все доступные зоны
        vehicleSkills.push(...allZoneIds);
      }
    }

    // Добавляем навыки агента с учетом смещения идентификаторов, если учитываем навыки
    if (planningParams.considerSkills && Array.isArray(agent.skills) && agent.skills.length > 0) {
      vehicleSkills.push(...agent.skills.map(skillId => skillId + 1000));
    }

    // Формируем объект транспортного средства
    const vehicle = {
      id: Number(agent.pk),
      capacity: [agent.weight_max * 1000, agent.volume_max * 1000],
      costs: { fixed: Number(agent.fixed_cost) || 0 },
      time_window: [timeWindowStart, timeWindowEnd],
      max_tasks: Number(planningParams.maxTasks) || 25,
      max_distance: Number(planningParams.maxRouteLength) * 1000 || 100000,
      speed_factor: 0.63,
      steps: agent.steps || [{ type: 'start' }],
    };

    // Добавляем start, если настроено начинать со склада
    if (planningParams.startFromWarehouse) {
      vehicle.start = startCoords;
    }

    // Добавляем end, если настроено возвращаться на склад
    if (planningParams.returnToStock) {
      vehicle.end = endCoords;
    }

    // Добавляем skills, если они есть
    if (vehicleSkills.length > 0) {
      vehicle.skills = vehicleSkills;
    }

    return vehicle;
  });

  const jobs = linkedOrders.map(order => {
    const serviceTime = order.plan_time_unload ? order.plan_time_unload : planningParams.unloadTime;
    const timeWindowBegin = this.convertOrderToUnix(order.plan_time_begin);
    const timeWindowEnd = this.convertOrderToUnix(order.plan_time_end);

    // Формируем массив skills для заказа
    let jobSkills = [];

  // Добавляем зону заказа в `jobSkills`, если учитываем зоны и `pk_zone` является положительным числом
if (planningParams.considerZones && Number(order.pk_zone) > 0) {
  jobSkills.push(Number(order.pk_zone));
}

    // Добавляем навыки заказа с учетом смещения идентификаторов, если учитываем навыки
    if (planningParams.considerSkills && Array.isArray(order.skills) && order.skills.length > 0) {
      jobSkills.push(...order.skills.map(skillId => skillId + 1000));
    }

    // Формируем объект задания (заказа)
    const job = {
      id: Number(order.pk),
      description: order.name,
      service: serviceTime * 60, // Переводим минуты в секунды
      location: [order.plan_lon_x, order.plan_lat_y],
      time_windows: [
        [timeWindowBegin, timeWindowEnd]
      ],
      delivery: [order.weight * 1000, order.volume * 1000],
    };

    // Добавляем skills, если они есть
    if (jobSkills.length > 0) {
      job.skills = jobSkills;
    }

    return job;
  });

  return {
    vehicles,
    jobs,
    options: { g: true },
    unlinkedOrdersCount, // Добавляем это поле для информирования пользователя
  };
},


// Метод для открытия модального окна добавления агента
openAddAgentModal() {
    // Сбросить данные формы
    this.newAgent = {
      name: '',
      code: '',
      phone: '',
      time_start: '',
      time_end: '',
      login: '',
      psw: '',
      is_active: false,
      weight_max: 0,
      volume_max: 0,
      zones: '',
      skills: '',
      // Добавьте другие поля, если необходимо
    };
    this.addAgentDialog = true;
  },

  // Метод для отправки формы добавления агента
  async submitNewAgent() {
  // Валидация формы (опционально)
  if (!this.newAgent.code || !this.newAgent.name) {
    alert('Пожалуйста, заполните обязательные поля.');
    return;
  }

  try {
    // Отправка POST запроса на создание нового агента
    const response = await axios.post('http://185.155.18.145:15777/api/agents', {
      ...this.newAgent
      // createtime: new Date(), // Удалено
    });

    // Добавление нового агента в список после успешного создания
    this.agents.push(response.data);

    // Закрытие модального окна
    this.addAgentDialog = false;

    // Очистка формы
    this.newAgent = {
      name: '',
      code: '',
      phone: '',
      time_start: '',
      time_end: '',
      login: '',
      psw: '',
      is_active: false,
      weight_max: 0,
      volume_max: 0,
      // Добавьте другие поля, если необходимо
    };

    // Опционально: показать уведомление об успешном добавлении
    this.$toast.success('Водитель успешно добавлен.');

  } catch (error) {
    console.error('Ошибка при добавлении водителя:', error);
    this.$toast.error('Произошла ошибка при добавлении водителя.');
  }
},

async fetchRoutes(filter = {}, selectedRoutePks = []) {
  this.isLoading = true; // Начало загрузки
  try {
    const response = await axios.get("http://185.155.18.145:15777/api/routes", { params: filter });
    if (response.data && Array.isArray(response.data)) {
      // Логика обработки данных
      const isSelectMap = {};
      this.routes.forEach(route => {
        isSelectMap[route.pk] = route.is_select;
      });

      this.routes = response.data.map(route => {
        const isSelected = Array.isArray(selectedRoutePks) && selectedRoutePks.includes(route.pk)
          ? true
          : isSelectMap[route.pk] || false;
        if (isSelected) {
          this.displayRouteOnMap(route);
        }

        return {
          ...route,
          is_select: isSelected,
        };
      });
    } else {
      this.routes = [];
    }
  } catch (error) {
    console.error("Ошибка при загрузке маршрутов:", error);
  } finally {
    this.isLoading = false; // Завершение загрузки
  }
},

applyDateFilter(selectedRoutePks = []) {
  this.clearMap(); // Очищаем карту от старых полилиний и маркеров
  this.routes = []; // Сбрасываем список маршрутов
  if (this.filterDate) {
    const dateObj = new Date(this.filterDate);
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;
    this.fetchOrders({ date: formattedDate }, selectedRoutePks)
      .then(() => {
        this.fetchRoutes({ date: formattedDate }, selectedRoutePks);
      });
  } else {
    this.fetchOrders({}, selectedRoutePks)
      .then(() => {
        this.fetchRoutes({}, selectedRoutePks);
      });
  }
},

    /**
     * Метод для открытия модального окна редактирования маршрута.
     * @param {Object} route - Объект маршрута.
     */
     openEditRouteModal(route) {
      console.log('Opening Edit Route Modal for route:', route);
      this.selectedRoute = { ...route };
      this.editRouteDialog = true;
    },

  async submitEditRoute() {
    try {
      await axios.put(`http://185.155.18.145:15777/api/routes/${this.selectedRoute.pk}`, this.selectedRoute);
      this.editRouteDialog = false;
      this.applyDateFilter(); // Обновляем данные после редактирования
    } catch (error) {
      console.error("Ошибка при редактировании маршрута", error);
    }
  },
  async confirmDeleteRoute() {
  const self = this; // Сохраняем контекст this

  if (confirm('Вы уверены, что хотите удалить этот маршрут?')) {
    try {
      await this.executeWithLoading(async () => {
        console.log(`Начинаем удаление маршрута pk=${self.selectedRoute.pk}`);

        // Удаляем маршрут
        await axios.delete(`http://185.155.18.145:15777/api/routes/${self.selectedRoute.pk}`);
        console.log('Маршрут удалён:', self.selectedRoute.pk);

        // Удаляем маршрут из локального массива
        self.routes = self.routes.filter(route => route.pk !== self.selectedRoute.pk);
        console.log(`Маршрут pk=${self.selectedRoute.pk} удалён из локального массива.`);

        // Удаляем полилинию маршрута с карты
        self.removeRouteOnMap(self.selectedRoute);
        console.log(`Полилиния маршрута pk=${self.selectedRoute.pk} удалена с карты.`);

        // Сбрасываем связанные заказы
        await axios.post('http://185.155.18.145:15777/api/reset_orders', { pk_route: self.selectedRoute.pk });
        console.log(`Связанные заказы для маршрута pk=${self.selectedRoute.pk} сброшены.`);

        // Закрываем диалог редактирования
        self.editRouteDialog = false;

        // Отображаем уведомление об успешном удалении
        self.showSnackbar('Маршрут успешно удалён.');
      });
    } catch (error) {
      console.error('Ошибка при удалении маршрута:', error);
      alert('Произошла ошибка при удалении маршрута. Проверьте консоль для деталей.');
    }
  }
},

    
    async deleteRoute(pk) {
  if (!pk) {
    console.error("Ошибка: код маршрута не определён");
    return;
  }

  const self = this; // Сохраняем контекст

  try {
    await this.executeWithLoading(async () => {
      console.log(`Начинаем удаление маршрута pk=${pk}`);

      // Удаляем маршрут
      const deleteResponse = await axios.delete(`http://185.155.18.145:15777/api/routes/${pk}`);
      console.log(`Маршрут pk=${pk} удалён:`, deleteResponse.data);

      // Закрываем диалоги удаления
      self.editRouteDialog = false;
      self.deleteRouteConfirmationDialog = false;
      console.log(`Диалоги закрыты после удаления маршрута pk=${pk}.`);

      // Находим маршрут по pk для удаления его полилинии
      const route = self.routes.find(r => String(r.pk) === String(pk));
      if (route) {
        console.log(`Маршрут pk=${pk} найден в локальном массиве. Удаляем с карты.`);
        self.removeRouteOnMap(route);
        console.log(`Полилиния маршрута pk=${pk} удалена с карты.`);
      } else {
        console.log(`Маршрут pk=${pk} не найден в локальном массиве.`);
      }

      // Обновляем заказы, связанные с маршрутом
      console.log(`Сбрасываем связанные заказы для маршрута pk=${pk}`);
      const resetResponse = await axios.post('http://185.155.18.145:15777/api/reset_orders', { pk_route: pk });
      console.log(`Связанные заказы для маршрута pk=${pk} сброшены:`, resetResponse.data);

      // Применяем фильтр по дате
      self.applyDateFilter();
      console.log(`Фильтр по дате применён после удаления маршрута pk=${pk}.`);
    });
    console.log(`Метод deleteRoute(pk=${pk}) завершён успешно.`);
  } catch (error) {
    console.error("Ошибка при удалении маршрута", error);
    self.showSnackbar('Ошибка при удалении маршрута');
  }
},


openDeleteRoutesDialog() {
      this.deleteRoutesConfirmationDialog = true;
    },

  // Метод для массового удаления выбранных маршрутов
  async deleteSelectedRoutes() {
    const selectedRoutes = this.routes.filter(route => route.is_select);
    if (selectedRoutes.length === 0) {
      alert("Нет выбранных маршрутов для удаления.");
      this.deleteRoutesConfirmationDialog = false;
      return;
    }

    // Извлекаем массив pk маршрутов для удаления
    const pksToDelete = selectedRoutes.map(route => route.pk);

    try {
      await this.executeWithLoading(async () => {
        console.log(`Начинаем массовое удаление ${pksToDelete.length} маршрутов.`);

        // Отправляем запрос на массовое удаление
        const response = await axios.delete('http://185.155.18.145:15777/api/routesbatch/', {
          data: { pks: pksToDelete },
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Массовое удаление прошло успешно:', response.data);

        // Удаляем маршруты из локального массива
        this.routes = this.routes.filter(route => !pksToDelete.includes(route.pk));

        // Удаляем маршруты с карты
        selectedRoutes.forEach(route => {
          this.removeRouteOnMap(route);
        });

        // Обновляем фильтр по дате для отражения изменений
        this.applyDateFilter();

        // Закрываем диалог подтверждения
        this.deleteRoutesConfirmationDialog = false;

        // Отображаем уведомление о успешном удалении
        this.showSnackbar('Маршруты успешно удалены.');
      });
    } catch (error) {
      console.error("Ошибка при массовом удалении маршрутов:", error);
      alert('Произошла ошибка при удалении маршрутов. Проверьте консоль для деталей.');
    }
},

    /**
     * Метод для отображения уведомлений (Snackbar)
     * Добавим это в ваш компонент
     */
    showSnackbar(message) {
      this.snackbar.message = message;
      this.snackbar.show = true;
    },



  onWindowResize() {
    // Пустой метод, чтобы вызвать обновление вычисляемого свойства
    // Можно добавить debounce для оптимизации
  },

  getCurrentDate() {
    const dateObj = new Date();
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  },

  onDateSelected(selectedDate) {
  if (!(selectedDate instanceof Date)) {
    selectedDate = new Date(selectedDate);
  }
  this.filterDate = this.formatDateForFilter(selectedDate); // Обновляем filterDate для фильтрации
  this.filterDateValue = this.formatDisplayDate(selectedDate); // Форматируем для отображения
  this.datemenu = false; // Закрываем меню после выбора даты
  this.applyDateFilter(); // Применяем фильтр
},

  formatDisplayDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  return `${day}.${month}.${year}`; // Форматируем в 'DD.MM.YYYY'
},

formatDateForFilter(date) {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    },

  async sendPlanningRequest(jsonData) {
  try {
    const response = await axios.post('http://185.155.18.145:15000', jsonData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Ответ от VROOM:', response.data);
    // Обработка ответа
    await this.processVroomResponse(response.data);
    // Обновление данных после планирования
    this.applyDateFilter();
    // Закрытие модального окна
    this.planningDialog = false;
  } catch (error) {
    console.error('Ошибка при отправке запроса на VROOM:', error);
    alert('Произошла ошибка при планировании маршрутов. Проверьте консоль для деталей.');
  }
},
async processVroomResponse(data) {
  if (!data.routes || !Array.isArray(data.routes)) {
    console.error('Нет маршрутов в ответе VROOM');
    return;
  }

  const newRoutePks = []; // Список pk новых маршрутов
  const ordersToUpdate = []; // Массив заказов для массового обновления

  for (const [index, route] of data.routes.entries()) {
    const routeColor = this.generateRandomColor(); // Генерируем случайный цвет

    const routeData = {
      code: index.toString(),
      name: `Маршрут ${index + 1} - ${this.filterDate}`,
      pk_agent: route.vehicle,
      plan_route_length: (route.distance / 1000).toFixed(2),
      duration: this.secondsToTime(route.duration + route.service),
      begin_time: this.unixToTimestamp(this.getStartArrival(route.steps)),
      end_time: this.unixToTimestamp(this.getEndArrival(route.steps)),
      geometry: route.geometry,
      color: routeColor,
      cost: route.cost,
    };

    // Сохраняем маршрут в БД
    const savedRoute = await this.createRoute(routeData);

    // Подготовка данных для обновления заказов
    let stepNumber = 1; // Counter for the route sequence
    for (const step of route.steps) {
      if (step.type === 'job') {
        const orderId = step.job;
        const arrival = this.unixToTimestamp(step.arrival);
        const pk_agent = route.vehicle;
        ordersToUpdate.push({
  pk: Number(orderId),  // Преобразуем в число
  route_num: Number(stepNumber),  // Преобразуем в число
  plan_time_arrival: arrival,  // Дата, уже в формате timestamp
  pk_agent: Number(pk_agent),  // Преобразуем в число
  pk_route: Number(savedRoute.pk),  // Преобразуем в число
  free: 0
});

        // Обновляем локальные данные
        const order = this.filteredOrders.find(o => o.pk === orderId);
        if (order) {
          order.route_num = stepNumber;
          order.plan_time_arrival = arrival;
          order.pk_agent = pk_agent;
          order.pk_route = savedRoute.pk;
          order.free = 0;
        }

        stepNumber++;
      }
    }

    newRoutePks.push(savedRoute.pk);
  }

  // Отправляем массовое обновление заказов
  if (ordersToUpdate.length > 0) {
    try {
      await axios.put('http://185.155.18.145:15777/api/ordersbatch', { orders: ordersToUpdate });
      console.log('Заказы успешно обновлены.');
    } catch (error) {
      console.error('Ошибка при массовом обновлении заказов:', error);
      alert('Произошла ошибка при обновлении заказов. Проверьте консоль для деталей.');
    }
  }

  // Применяем фильтр данных и передаем новые маршруты для установки is_select
  await this.applyDateFilter(newRoutePks);

  // Отображаем маршруты, которые выбраны
  this.routes.forEach(route => {
    if (route.is_select) {
      this.displayRouteOnMap(route);
    }
  });

  // Обновляем состояние чекбокса "Выбрать все"
  this.allRoutesSelected = this.routes.every(route => route.is_select);
},



secondsToTime(seconds) {
  const date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8);
},

unixToTimestamp(unixTime) {
  // Предполагаем, что unixTime в секундах
  const date = moment.unix(unixTime).tz(this.timezone);
  return date.format('YYYY-MM-DD HH:mm:ss');
},

getStartArrival(steps) {
  const startStep = steps.find(step => step.type === 'start');
  return startStep ? startStep.arrival : null;
},

getEndArrival(steps) {
  const endStep = steps.find(step => step.type === 'end');
  return endStep ? endStep.arrival : null;
},


async createRoute(routeData) {
  try {
    const response = await axios.post('http://185.155.18.145:15777/api/routes', routeData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании маршрута:', error);
    throw error;
  }
},

async updateOrdersForRoute(route, pk_route) {
  let stepNumber = 1; // Counter for the route sequence

  for (const step of route.steps) {
    if (step.type === 'job') {
      const orderId = step.job;
      const arrival = this.unixToTimestamp(step.arrival);
      const pk_agent = route.vehicle;

      // Update order on the server
      await this.updateOrder(orderId, {
        route_num: stepNumber,
        plan_time_arrival: arrival,
        pk_agent: pk_agent,
        pk_route: pk_route,
        free: 0
      });

      // Update local data
      const order = this.filteredOrders.find(o => o.pk === orderId);
      if (order) {
        order.route_num = stepNumber;
        order.plan_time_arrival = arrival;
        order.pk_agent = pk_agent;
        order.pk_route = pk_route;
        order.free = 0;
      }

      stepNumber++;
    }
  }
},
async updateOrder(orderId, updateData) {
  try {
    // Добавляем поле 'free': 0 в данные для обновления
    const dataToUpdate = {
      ...updateData,
      free: 0
    };
    await axios.put(`http://185.155.18.145:15777/api/orders/${orderId}`, dataToUpdate);
  } catch (error) {
    console.error(`Ошибка при обновлении заказа ${orderId}:`, error);
  }
},
decodeGeometry(geometry) {
  const coordinates = polyline.decode(geometry).map(coord => [coord[1], coord[0]]);
  return coordinates;
},

displayRouteOnMap(route) {
  if (this.routePolylines[route.pk]) {
    // Полилиния уже отображается
    return;
  }

  const coordinates = this.decodeGeometry(route.geometry);

  // Используем цвет маршрута или по умолчанию красный
  const routeColor = route.color || '#FF0000';

  // Создаем новую полилинию
  const polyline = new mapgl.Polyline(this.map, {
    coordinates: coordinates,
      color: routeColor,
      width: 4,
      zIndex: 5, // Устанавливаем zIndex для полилиний ниже, чем для маркеров
  });

   // Сохраняем полилинию и её параметры для возможного дальнейшего использования
 // Ensure that routePolylines is initialized as a reactive object in your data
if (!this.routePolylines) {
  this.routePolylines = {};
}

this.routePolylines[route.pk] = {
  polyline: polyline,
  options: {
    coordinates: coordinates,
    color: routeColor,
    width: 4,
    zIndex: 5, // Setting zIndex for polylines below markers
  },
};

  console.log(`Полилиния маршрута ${route.name} инициализирована.`);

  // Отображаем маркеры заказов для этого маршрута
  this.displayRouteMarkers(route);

},

clearPolylines() {
  if (this.polylines && this.polylines.length > 0) {
    this.polylines.forEach(polyline => {
      polyline.destroy();
    });
    this.polylines = [];
  }
},

removeRouteOnMap(route) {
  const routePk = route.pk;
  const routeData = this.routePolylines[routePk];
  if (routeData && routeData.polyline) {
    routeData.polyline.destroy();
    delete this.routePolylines[routePk];
  }

  // Удаляем маркеры для этого маршрута
  const markers = this.routeOrderMarkers[routePk];
  if (markers) {
    Object.values(markers).forEach(marker => {
      marker.destroy();
    });
    delete this.routeOrderMarkers[routePk];
  }
},


 /**
   * Обрабатывает изменение состояния чекбокса is_select для маршрута.
   * @param {Object} route - Маршрут, для которого изменено состояние.
   */
   onRouteSelectChange(route) {
    if (route.is_select) {
      this.displayRouteOnMap(route);
    } else {
      this.removeRouteOnMap(route); // Удаляем полилинию, если галочка снята
    }
},

   // Метод для переключения выбора всех маршрутов
   toggleSelectAllRoutes() {
    // Use the current value of allRoutesSelected to set is_select for all routes
    this.routes.forEach(route => {
      route.is_select = this.allRoutesSelected;
      this.updateSelectedRoutes(route);
    });
  },

  // Метод для обновления выбранного маршрута
  updateSelectedRoutes(route) {
    if (route.is_select) {
      this.displayRouteOnMap(route);
    } else {
      this.removeRouteOnMap(route);
    }
  },

  generateRandomColor() {
    // Генерируем случайный цвет в формате HEX
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  },



// Логика для создания маркера заказа с возможностью выделения
createOrderMarker(order, routeColor, markerType = 'default', routePk) {
  const iconUrl = `http://185.155.18.145:15777/api/icon?number=${order.route_num}&color=${encodeURIComponent(routeColor)}&type=${markerType}`;
  console.log(`Создаем маркер для заказа ${order.pk}`);

  const marker = new mapgl.Marker(this.map, {
    coordinates: [order.plan_lon_x, order.plan_lat_y],
    icon: iconUrl,
    size: [30, 30],
    zIndex: 10, // Устанавливаем более высокий zIndex для маркеров
  });

  marker.markerType = markerType;
  marker.orderId = order.pk;
  marker.routeColor = routeColor;
  marker.routePk = routePk; // Сохраняем routePk в маркере

  // Initialize popupHtml on the marker
  marker.popupHtml = null;
  let popupTimeout;


   // Event handlers for tooltip
   marker.on("mouseover", (event) => {
    clearTimeout(popupTimeout);
    if (!marker.popupHtml) {
      marker.popupHtml = this.createOrderPopupHtml(order);
      this.map.getContainer().appendChild(marker.popupHtml);
    }
    this.showPopup(event, marker.popupHtml, this.map);
  });

  marker.on("mouseout", () => {
    popupTimeout = setTimeout(() => {
      if (marker.popupHtml) {
        this.hidePopup(marker.popupHtml);
      }
    }, 300);
  });


  // Hide tooltip if dragging starts
  marker.on('mousedown', (event) => {
    // Hide tooltip if visible
    if (marker.popupHtml) {
      this.hidePopup(marker.popupHtml);
      clearTimeout(popupTimeout);
    }
  });

  // Обработчик клика по маркеру
  marker.on('click', () => {
    if (!this.routeOrderMarkers[routePk]) {
    this.routeOrderMarkers[routePk] = {};
  }
  const routeMarkers = this.routeOrderMarkers[routePk];

    // Удаляем текущий маркер
    marker.destroy();

    if (marker.markerType === 'selected') {
      // Создаём обычный маркер
      const defaultMarker = this.createOrderMarker(order, routeColor, 'default', routePk);
      routeMarkers[order.pk] = defaultMarker;

      this.enableMarkerDrag(defaultMarker, order, [order.plan_lon_x, order.plan_lat_y], routeColor);

      // Обновляем состояние заказа
      order.is_select = false;
    this.updateSingleMarker(order);
  } else {
      // Создаём выделенный маркер
      const selectedMarker = this.createOrderMarker(order, routeColor, 'selected', routePk);
    selectedMarker.setCoordinates(marker.getCoordinates());
    routeMarkers[order.pk] = selectedMarker;

    this.enableMarkerDrag(selectedMarker, order, [order.plan_lon_x, order.plan_lat_y], routeColor);

order.is_select = true;
this.updateSingleMarker(order);
}
    // Hide tooltip if visible
    if (marker.popupHtml) {
      this.hidePopup(marker.popupHtml);
      clearTimeout(popupTimeout);
    }

  });

// Обработчик клика с проверкой клавиши Ctrl
marker.on('click', async (event) => {
    console.log(`Click detected on marker for order ${order.pk}`);

    // Проверяем, нажата ли клавиша D через переменную isDPressed
    if (this.isDPressed) {
        console.log(`D + Click detected on marker for order ${order.pk}`);
        
        // Здесь вызываем функцию для обработки D + Click
        await this.handleMarkerCtrlClick(marker, order, routePk);
    } else {
        console.log('D key not pressed during click');
    }
});
  
  return marker;
},

displayRouteMarkers(route) {
  const ordersInRoute = this.filteredOrders.filter(order => String(order.pk_route) === String(route.pk));
  console.log('Orders in route:', ordersInRoute.map(order => order.pk));
  // Инициализируем коллекцию маркеров для этого маршрута
  if (!this.routeOrderMarkers[route.pk]) {
    this.routeOrderMarkers[route.pk] = {};
  }

  // Удаляем старые маркеры, если заказ больше не в маршруте
  const existingMarkers = Object.keys(this.routeOrderMarkers[route.pk]);
  existingMarkers.forEach(orderPk => {
    const orderStillInRoute = ordersInRoute.some(order => String(order.pk) === orderPk);
    if (!orderStillInRoute) {
      this.routeOrderMarkers[route.pk][orderPk].destroy();
      delete this.routeOrderMarkers[route.pk][orderPk];
    }
  });

  // Добавляем новые маркеры
  ordersInRoute.forEach(order => {
    if (this.routeOrderMarkers[route.pk][order.pk]) {
      // Удаляем старый маркер, если он существует
      this.routeOrderMarkers[route.pk][order.pk].destroy();
      delete this.routeOrderMarkers[route.pk][order.pk];
    }

    // Создаём новый маркер
    const marker = this.createOrderMarker(order, route.color, 'default', route.pk);
    let initialCoordinates = [order.plan_lon_x, order.plan_lat_y];

    // Включаем перетаскивание маркера
    this.enableMarkerDrag(marker, order, initialCoordinates, route.color);

    // Сохраняем маркер в коллекции маршрута
    this.routeOrderMarkers[route.pk][order.pk] = marker;
  });
},

enableMarkerDrag(marker, order, initialCoordinates, routeColor) {
  let dragging = false;
  let placeholderMarker = null;
  let highlightedRoutePk = null;
  let initialRoute = order.pk_route;

  const onMouseMove = (event) => {
    if (!dragging) return;

    const rect = this.map.getContainer().getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;
    const newCoordinates = this.map.unproject([relativeX, relativeY]);

    if (newCoordinates && newCoordinates.length === 2) {
      marker.setCoordinates(newCoordinates);
    }

    // Проверяем пересечение маркера с другим маршрутом
    const routeUnderCursor = this.getRouteUnderCursor(event);

    // Если курсор над полилинией другого маршрута, подсвечиваем его
    if (routeUnderCursor && highlightedRoutePk !== routeUnderCursor.pk) {
      // Убираем подсветку с предыдущего маршрута
      if (highlightedRoutePk) {
        this.updateRoutePolylineStyle(highlightedRoutePk, { width: 2 });
      }

      // Подсвечиваем текущий маршрут
      this.updateRoutePolylineStyle(routeUnderCursor.pk, { width: 4 });  // Делаем полилинию толще

      highlightedRoutePk = routeUnderCursor.pk;
    } else if (!routeUnderCursor && highlightedRoutePk) {
      // Убираем подсветку, если ни один маршрут не под курсором
      this.updateRoutePolylineStyle(highlightedRoutePk, { width: 2 });
      highlightedRoutePk = null;
    }
  };

  // Начало перетаскивания
  marker.on('mousedown', (event) => {
    dragging = true;
    this.map.setOption('disableDragging', true); // Отключаем перетаскивание карты

    // Создаем и отображаем плейсхолдер
    placeholderMarker = this.createOrderMarker(order, routeColor, 'placeholder');
    placeholderMarker.setCoordinates(initialCoordinates); // Ставим на исходные координаты

    // Подсвечиваем исходный маршрут
    this.updateRoutePolylineStyle(initialRoute, { width: 4 });

    // Добавляем обработчики событий
    document.addEventListener('mousemove', onMouseMove);
  });

  // Завершение перетаскивания маркера
  document.addEventListener('mouseup', async (event) => {
    if (dragging) {
      dragging = false;
      this.map.setOption('disableDragging', false); // Включаем обратно перетаскивание карты

      // Убираем плейсхолдер
      if (placeholderMarker) {
        placeholderMarker.destroy();
        placeholderMarker = null;
      }

      // Проверяем, куда был отпущен маркер
      const targetRoute = this.getRouteUnderCursor(event, initialRoute);

      if (!targetRoute) {
        console.log('Маркер отпущен не над маршрутом.');
        // Если ни один маршрут не был выбран, возвращаем маркер на исходные координаты
        marker.setCoordinates(initialCoordinates);
        return; // Прерываем выполнение функции, если не найден целевой маршрут
      }

      console.log(`Маркер отпущен над маршрутом: ${targetRoute.name}`);

      // Проверяем вместимость нового маршрута
      const agent = this.agents.find(a => String(a.pk) === String(targetRoute.pk_agent));
      const routeOrders = this.filteredOrders.filter(o => String(o.pk_route) === String(targetRoute.pk));

      if (this.canAddOrderToRoute(order, routeOrders, agent)) {
  console.log('Заказ помещается в маршрут. Переносим заказ.');


  // Пробуем добавить заказ в новый маршрут
  //await this.addOrderToRoute(order, targetRoute);


  // Пересчёт маршрутов
  await this.recalculateRoute(targetRoute, [...routeOrders, order]);

  const initialRouteObj = this.routes.find(r => String(r.pk) === String(initialRoute));
  if (initialRouteObj) {
    const initialRouteOrders = this.filteredOrders.filter(o => 
      String(o.pk_route) === String(initialRoute) && String(o.pk) !== String(order.pk)
    );
    await this.recalculateRoute(initialRouteObj, initialRouteOrders);
  }

   // Remove and display routes on map
   this.removeRouteOnMap(targetRoute);
        this.displayRouteOnMap(targetRoute);
        if (initialRouteObj) {
          this.removeRouteOnMap(initialRouteObj);
          this.displayRouteOnMap(initialRouteObj);
        }

        // Update markers of free orders
        this.updateMapMarkers();
        this.applyDateFilter();

      } else {
        console.log('Order does not fit in the route.');
        alert('Order cannot be added to the route due to weight or volume constraints.');
        marker.setCoordinates(initialCoordinates);
      }

      document.removeEventListener('mousemove', onMouseMove);
    }
  });
},
async recalculateRoute(route, orders) {
    // Шаг 1: Получаем данные агента, связанного с маршрутом
    const agent = this.agents.find(a => String(a.pk) === String(route.pk_agent));

    if (!agent) {
      console.error(`Агент с pk ${route.pk_agent} не найден`);
      return;
    }

    // Шаг 2: Генерируем JSON для VROOM
    const jsonData = this.generateVroomDataForRoute(agent, orders, route);

    console.log("Отправка данных на VROOM для пересчёта маршрута:", JSON.stringify(jsonData, null, 2));

    // Шаг 3: Отправляем запрос на VROOM
    try {
      const response = await axios.post('http://185.155.18.145:15000', jsonData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Ответ от VROOM при пересчёте маршрута:', response.data);

      // Шаг 4: Обрабатываем ответ и обновляем маршрут и заказы
      await this.processVroomRouteResponse(response.data, route);

      // Шаг 5: Обновляем отображение маршрута на карте
     // Удаляем маркеры заказов, которые больше не в маршруте
  const routeMarkers = this.routeOrderMarkers[route.pk] || {};
  for (const orderPk in routeMarkers) {
    const orderInRoute = orders.find(o => o.pk === parseInt(orderPk, 10));
    if (!orderInRoute) {
      // Удаляем маркер для заказа, который больше не в маршруте
      routeMarkers[orderPk].destroy();
      delete routeMarkers[orderPk];
    }
  }
      
      this.removeRouteOnMap(route);
      this.displayRouteOnMap(route);
   

    } catch (error) {
      console.error('Ошибка при пересчёте маршрута:', error);
      alert('Произошла ошибка при пересчёте маршрута. Проверьте консоль для деталей.');
    }
  },

  // Добавьте метод для генерации данных для VROOM
  generateVroomDataForRoute(agent, orders, route) {
    // Собираем данные транспортного средства
    const vehicle = {
      id: Number(agent.pk),
      start: [agent.start_x_stock, agent.start_y_stock],
      capacity: [agent.weight_max * 1000, agent.volume_max * 1000], // Вес и объем в граммах и миллилитрах
      time_window: [
        this.convertVehicleToUnix(this.filterDate + ' ' + agent.time_start),
        this.convertVehicleToUnix(this.filterDate + ' ' + agent.time_end)
      ],
      speed_factor: 0.63,
      // Дополнительно можно передать существующие шаги
    };

    // Собираем заказы
      const jobs = orders.map(order => {
      const timeWindowBegin = this.convertOrderToUnix(order.plan_time_begin);
      const timeWindowEnd = this.convertOrderToUnix(order.plan_time_end);

      return {
        id: Number(order.pk),
        description: order.name,
        service: order.plan_time_unload * 60, // Переводим минуты в секунды
        location: [order.plan_lon_x, order.plan_lat_y],
        time_windows: [
          [timeWindowBegin, timeWindowEnd]
        ],
        delivery: [order.weight * 1000, order.volume * 1000], // Вес и объем
      };
    });

    return {
      vehicles: [vehicle],
      jobs: jobs,
      options: { g: true }
    };
  },

  // Метод для обработки ответа от VROOM при пересчёте маршрута
  async processVroomRouteResponse(data, route) {
    if (!data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
      console.error('Нет маршрутов в ответе VROOM');
      return;
    }

    const vroomRoute = data.routes[0]; // Берём первый маршрут

    // Обновляем данные маршрута
    route.plan_route_length = (vroomRoute.distance / 1000).toFixed(2);
    route.duration = this.secondsToTime(vroomRoute.duration + vroomRoute.service);
    route.begin_time = this.unixToTimestamp(this.getStartArrival(vroomRoute.steps));
    route.end_time = this.unixToTimestamp(this.getEndArrival(vroomRoute.steps));
    route.geometry = vroomRoute.geometry;
    route.cost = vroomRoute.cost;
 
    // Сохраняем обновлённый маршрут в БД
 await this.updateRoute(route);
      // Update route in this.routes
  const routeIndex = this.routes.findIndex(r => String(r.pk) === String(route.pk));
  if (routeIndex !== -1) {
    this.routes[routeIndex] = route;
  } else {
    this.routes.push(route);
  }

    // Обновляем заказы, связанные с маршрутом
    await this.updateOrdersForRoute(vroomRoute, route.pk);
  },

  async updateRoute(route) {
    try {
      await axios.put(`http://185.155.18.145:15777/api/routes/${route.pk}`, route);
    } catch (error) {
      console.error(`Ошибка при обновлении маршрута ${route.pk}:`, error);
    }
  },

  canAddOrderToRoute(order, routeOrders, agent) {
    const totalWeight = routeOrders.reduce((sum, o) => sum + o.weight, 0) + order.weight;
    const totalVolume = routeOrders.reduce((sum, o) => sum + o.volume, 0) + order.volume;

    return totalWeight <= agent.weight_max && totalVolume <= agent.volume_max;
  },

  async removeOrderFromRoute(order) {
    try {
    // Reset order on the server
    await axios.post('http://185.155.18.145:15777/api/reset_order', { pk_order: order.pk });
    console.log(`Order ${order.pk} successfully reset.`);
  } catch (error) {
    console.error(`Error resetting order ${order.pk}:`, error);
  }

  // Update local data
  const orderToUpdate = this.filteredOrders.find(o => o.pk === order.pk);
  if (orderToUpdate) {
    orderToUpdate.free = 1;
    orderToUpdate.pk_route = null;
    orderToUpdate.pk_agent = null;
    orderToUpdate.route_num = null;
    orderToUpdate.plan_time_arrival = null;
  }

  // Update markers
  this.updateMapMarkers();
},
getRouteUnderCursor(event, excludeRoutePk = null) {
  const mapContainer = this.map.getContainer();
  const rect = mapContainer.getBoundingClientRect();
  const relativeX = event.clientX - rect.left;
  const relativeY = event.clientY - rect.top;
  const cursorCoordinates = this.map.unproject([relativeX, relativeY]);

  const MAX_DISTANCE_METERS = 200; // Реалистичное значение

  const cursorPoint = turf.point(cursorCoordinates);

  // Проверяем близость курсора к маркерам маршрутов
  for (const route of this.routes) {
    if (String(route.pk) === String(excludeRoutePk)) {
      // Пропускаем исходный маршрут
      continue;
    }

    const routeMarkers = this.routeOrderMarkers[route.pk];
    if (routeMarkers) {
      for (const marker of Object.values(routeMarkers)) {
        const markerCoordinates = marker.getCoordinates();
        const markerPoint = turf.point(markerCoordinates);
        const distance = turf.distance(cursorPoint, markerPoint, { units: 'meters' });
        if (distance <= MAX_DISTANCE_METERS) {
          return route;
        }
      }
    }
  }

  // Проверяем близость курсора к полилиниям маршрутов
  for (const routePk in this.routePolylines) {
    if (String(routePk) === String(excludeRoutePk)) {
      // Пропускаем исходный маршрут
      continue;
    }

    const routeData = this.routePolylines[routePk];
    if (!routeData || !routeData.options || !routeData.options.coordinates) continue;
    const lineCoordinates = routeData.options.coordinates;
    const lineString = turf.lineString(lineCoordinates);
    const snapped = turf.nearestPointOnLine(lineString, cursorPoint, { units: 'meters' });
    const distance = snapped.properties.dist; // Расстояние в метрах

    if (distance <= MAX_DISTANCE_METERS) {
      const route = this.routes.find(r => String(r.pk) === String(routePk));
      if (route) {
        return route;
      }
    }
  }

  return null; // Если ничего не найдено, возвращаем null
},

  async addOrderToRoute(order, route) {
    try {
      // Обновляем заказ, добавляя его в маршрут
      await axios.put(`http://185.155.18.145:15777/api/orders/${order.pk}`, {
        pk_route: route.pk,
        pk_agent: route.pk_agent,
        free: 0 // Заказ становится назначенным
      });
    } catch (error) {
      console.error(`Ошибка при добавлении заказа ${order.pk} в маршрут ${route.pk}:`, error);
    }
  },

  async handleMarkerCtrlClick(marker, order, routePk) {
  console.log(`Handling D + Click for order ${order.pk} on route ${routePk}`);

  if (confirm(`Вы уверены, что хотите удалить заказ ${order.pk} из маршрута?`)) {
    try {
      // Удаляем заказ из маршрута на сервере
      await this.removeOrderFromRoute(order);
      console.log(`Order ${order.pk} removed from route ${routePk} on server`);

      // Обновляем локальные данные
      order.free = 1; // Устанавливаем в 1, чтобы отметить как свободный
      order.pk_route = null;
      order.pk_agent = null;
      order.is_select = false;
      console.log(`Local order ${order.pk} state updated: free=1, pk_route=null, pk_agent=null, is_select=false`);

      // Удаляем маркер из коллекции маршрутов
      if (this.routeOrderMarkers[routePk] && this.routeOrderMarkers[routePk][order.pk]) {
  const markerToDestroy = this.routeOrderMarkers[routePk][order.pk];
  if (markerToDestroy) {
    markerToDestroy.destroy();
    delete this.routeOrderMarkers[routePk][order.pk];
    console.log(`Marker for order ${order.pk} destroyed and removed from routeOrderMarkers`);
  } else {
    console.warn(`Marker for order ${order.pk} is already null or undefined.`);
  }
}

      // Удаляем маркер из коллекции свободных маркеров, если он там есть
      if (this.freeOrderMarkers[order.pk]) {
  const freeMarkerToDestroy = this.freeOrderMarkers[order.pk];
  if (freeMarkerToDestroy) {
    freeMarkerToDestroy.destroy();
    delete this.freeOrderMarkers[order.pk];
    console.log(`Marker for order ${order.pk} destroyed and removed from freeOrderMarkers`);
  } else {
    console.warn(`Free marker for order ${order.pk} is already null or undefined.`);
  }
}
      // Обновляем маркеры на карте
      this.updateMapMarkers();
      console.log(`updateMapMarkers called`);

      // Пересчитываем маршрут
      const updatedRoute = this.routes.find(r => String(r.pk) === String(routePk));
      if (updatedRoute) {
        const routeOrders = this.filteredOrders.filter(o => String(o.pk_route) === String(routePk) && o.pk !== order.pk);
        console.log(`Recalculating route ${routePk} with orders:`, routeOrders.map(o => o.pk));
        await this.recalculateRoute(updatedRoute, routeOrders);
        console.log(`Route ${routePk} recalculated`);
      }

      // Обновляем отображение таблиц
      this.applyDateFilter();
      console.log(`applyDateFilter called`);

      // Дополнительная проверка состояния маркеров
      console.log('Current freeOrderMarkers:', this.freeOrderMarkers);
      console.log('Current routeOrderMarkers:', this.routeOrderMarkers);
    } catch (error) {
      console.error(`Ошибка при удалении заказа ${order.pk} из маршрута:`, error);
      alert('Произошла ошибка при удалении заказа из маршрута.');
    }
  }
},

  updateRoutePolylineStyle(routePk, newOptions) {
  const routeData = this.routePolylines[routePk];
  if (!routeData || !routeData.polyline) return;

  // Уничтожаем существующую полилинию
  routeData.polyline.destroy();

  // Обновляем параметры полилинии
  const updatedOptions = {
    ...routeData.options,
    ...newOptions,
  };

  // Создаем новую полилинию с обновленными параметрами
  const newPolyline = new mapgl.Polyline(this.map, updatedOptions);

  // Сохраняем новую полилинию и обновленные параметры
  this.routePolylines[routePk] = {
  polyline: newPolyline,
  options: updatedOptions,
};},

openAddressBindingModal(order) {
    this.currentOrderAddress = order.addr;
    this.currentOrderId = order.pk;
    this.currentOrderCode = order.code;
    this.currentOrderName = order.name;
    this.addressBindingDialog = true;
    this.geocodedAddresses = [];
    this.selectedGeocodedAddress = null;
  },

  // Закрываем модальное окно
  closeAddressBindingDialog() {
    this.addressBindingDialog = false;
  },

  // Отправляем запрос к Яндекс Геокодеру
  async geocodeAddress() {
    const apiKey = this.yandexApiKey;
    const address = encodeURIComponent(this.currentOrderAddress);
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=${address}`;

    try {
      const response = await axios.get(url);
      const geoObjects = response.data.response.GeoObjectCollection.featureMember;

      if (geoObjects.length === 0) {
        alert('Адрес не найден.');
        return;
      }

      // Обрабатываем полученные адреса и сохраняем их
      this.geocodedAddresses = geoObjects.map((obj) => {
        const geoObject = obj.GeoObject;
        const point = geoObject.Point.pos.split(' ').map(Number).reverse(); // [latitude, longitude]
        return {
          formattedAddress: geoObject.metaDataProperty.GeocoderMetaData.text,
          coordinates: point,
        };
      });
    } catch (error) {
      console.error('Ошибка при геокодировании адреса:', error);
      alert('Произошла ошибка при геокодировании адреса.');
    }
  },

  // Сохраняем выбранный адрес и обновляем заказ
  async bindSelectedAddress() {
  if (!this.selectedGeocodedAddress) {
    alert('Пожалуйста, выберите адрес.');
    return;
  }

  const [lat, lon] = this.selectedGeocodedAddress.coordinates;

  try {
    // Отправляем запрос на обновление заказа на сервере
    await axios.put(`http://185.155.18.145:15777/api/orders/${this.currentOrderId}`, {
      plan_lon_x: lon,
      plan_lat_y: lat,
    });

    // Обновляем локальные данные заказа
    const orderIndex = this.filteredOrders.findIndex(order => order.pk === this.currentOrderId);
    if (orderIndex !== -1) {
      // Присваиваем новые значения свойствам заказа
      this.filteredOrders[orderIndex].plan_lon_x = lon;
      this.filteredOrders[orderIndex].plan_lat_y = lat;
    }

    // Переходим к следующему выбранному заказу или закрываем модальное окно
    this.moveToNextUnlinkedOrder();

  } catch (error) {
    console.error('Ошибка при обновлении заказа:', error);
    alert('Произошла ошибка при обновлении заказа.');
  }
},

  // Переходим к следующему непривязанному заказу или закрываем модалку
  moveToNextUnlinkedOrder() {
    this.currentOrderIndex++;

    if (this.currentOrderIndex < this.ordersToBind.length) {
      // Переходим к следующему заказу
      const nextOrder = this.ordersToBind[this.currentOrderIndex];
      this.openAddressBindingModal(nextOrder);
    } else {
      // Все заказы обработаны
      this.addressBindingDialog = false;
      this.applyDateFilter();// Обновляем список заказов
    }
  },


  openAddressBindingModalForSelectedOrders() {
    // Получаем выбранные заказы
    const selectedOrders = this.sortedOrders.filter(order => order.is_select);

    if (selectedOrders.length === 0) {
      alert('Пожалуйста, выберите хотя бы один заказ для привязки адреса.');
      return;
    }

    // Начинаем обработку выбранных заказов
    this.ordersToBind = selectedOrders;
    this.currentOrderIndex = 0;
    this.openAddressBindingModal(this.ordersToBind[this.currentOrderIndex]);
  },

  selectAllColumns() {
      this.visibleOrderColumns = this.headersorders.map(header => header.value);
    },

   /**
 * Вспомогательный метод для управления индикатором загрузки
 * @param {Function} operation - Асинхронная функция, которую нужно выполнить
 */
 async executeWithLoading(operation) {
  this.isLoading = true;
  console.log("Loading started");
  try {
    await operation();
  } catch (error) {
    throw error;
  } finally {
    this.isLoading = false;
    console.log("Loading finished");
  }
},

  openChangeDriverDialog(route) {
    this.selectedRouteForDriverChange = route;
    this.fetchAvailableDrivers(); // Загрузка списка водителей
    this.changeDriverDialog = true; // Открытие модалки
  },
  fetchAvailableDrivers() {
    // Здесь нужно сделать запрос на сервер для получения списка водителей
    axios.get('http://185.155.18.145:15777/api/agents')
      .then(response => {
        this.availableDrivers = response.data;
      })
      .catch(error => {
        console.error('Ошибка при загрузке водителей:', error);
      });
  },
  updateDriverForRoute(driver) {
    // Логика смены водителя
    this.selectedRouteForDriverChange.pk_agent = driver.pk;

    // Обновление маршрута на сервере
    axios.put(`http://185.155.18.145:15777/api/routes/${this.selectedRouteForDriverChange.pk}`, {
      pk_agent: driver.pk,
    })
      .then(() => {
        this.changeDriverDialog = false; // Закрытие модалки после успешного обновления
        this.applyDateFilter(); // Обновление данных
      })
      .catch(error => {
        console.error('Ошибка при обновлении маршрута:', error);
      });
  },

  confirmDriverChange() {
    // Проверим, выбран ли водитель перед тем, как открыть диалог
    if (this.selectedDriver) {
      this.confirmDriverChangeDialog = true;
    } else {
      alert('Пожалуйста, выберите водителя.');
    }
  },
   applyDriverChange() {
      if (this.selectedDriver) {
        this.updateDriverForRoute(this.selectedDriver);
        this.confirmDriverChangeDialog = false;
        this.changeDriverDialog = false;
      }
    },

  filterDrivers() {
    // Логика фильтрации водителей
    if (!this.searchQuery) {
      this.filteredDrivers = this.availableDrivers;
    } else {
      this.filteredDrivers = this.availableDrivers.filter(driver =>
        driver.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },

  onDriverSelected(selected) {
      console.log('Выбранный водитель через автокомплит:', selected);
      // Дополнительная логика при выборе водителя, если необходимо
    },
    openConfirmDialog() {
      if (this.selectedDriver) {
        console.log('Открываем подтверждение для водителя:', this.selectedDriver);
        this.confirmDriverChangeDialog = true;
      } else {
        this.showSnackbar('Пожалуйста, выберите водителя.');
      }
    },

    isAgentBusy(agent) {
    return this.agentsWithRouteInfo1.some(a => String(a.pk) === String(agent.pk));
  },
  canFitOrders(agent) {
  // Проверяем, есть ли выбранный маршрут
  if (!this.selectedRouteForDriverChange) {
    return false;
  }

  const totalWeight = this.selectedRouteForDriverChange.route_weight;
  const totalVolume = this.selectedRouteForDriverChange.route_volume;

  // Сравниваем вес и объём маршрута с максимальной вместимостью агента
  return agent.weight_max >= totalWeight && agent.volume_max >= totalVolume;
},

openCreateRouteDialog() {
    this.newRouteName = '';
    this.routeNameDialog = true;
  },
  confirmAddOrdersToRoute() {
    this.routeNameDialog = false;
    this.selectedOrdersCount = this.filteredOrders.filter(order => order.is_select).length;

    if (this.selectedOrdersCount > 0) {
      this.addSelectedOrdersDialog = true;
    } else {
      this.openRouteBuilderDialog(false);
    }
  },
  openRouteBuilderDialog(addSelected) {
    this.addSelectedOrdersDialog = false;
    // Создаём копии списков, чтобы избежать мутаций исходных данных
    this.availableOrders = this.filteredOrders.filter(order => order.free === 1 && !order.is_select).map(order => ({ ...order }));
    this.routeOrders = addSelected
      ? this.filteredOrders.filter(order => order.is_select).map(order => ({ ...order }))
      : [];

    // Сбрасываем выделение заказов
    this.filteredOrders.forEach(order => (order.is_select = false));

    // Открываем диалог
    this.routeBuilderDialog = true;
  },
  async saveRoute() {
  // Проверки
  if (this.routeOrders.length === 0) {
    alert('Маршрут должен содержать хотя бы один заказ.');
    return;
  }

  if (!this.selectedWarehouse) {
    alert('Пожалуйста, выберите склад.');
    return;
  }

  const warehouse = this.stocks.find(stock => stock.gid === this.selectedWarehouse);

  if (!warehouse) {
    alert('Выбранный склад не найден.');
    return;
  }

  try {
    // Формируем данные для VROOM
    const jsonData = this.generateVroomDataForManualRoute(warehouse, this.routeOrders);

    console.log("Отправка данных на VROOM для расчёта маршрута:", JSON.stringify(jsonData, null, 2));

    // Отправляем запрос в VROOM
    const response = await axios.post('http://185.155.18.145:15000', jsonData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Ответ от VROOM при расчёте маршрута:', response.data);

    // Обрабатываем ответ VROOM
    if (this.isEditingRoute) {
      // Обновляем существующий маршрут
      await this.processVroomManualRouteResponse(response.data, warehouse, this.currentRoute.pk);
    } else {
      // Создаём новый маршрут
      await this.processVroomManualRouteResponse(response.data, warehouse);
    }

    // Закрываем диалог и обновляем данные
    this.closeRouteBuilderDialog();
    this.applyDateFilter();
    this.showSnackbar('Маршрут успешно создан.');

  } catch (error) {
    console.error('Ошибка при расчёте и сохранении маршрута:', error);
    alert('Произошла ошибка при расчёте и сохранении маршрута.');
  }
},

  isInFilteredAvailable(order) {
    if (!this.searchAvailable) return true;
    const search = this.searchAvailable.toLowerCase();
    return (
      order.name.toLowerCase().includes(search) ||
      order.code.toLowerCase().includes(search) ||
      order.addr.toLowerCase().includes(search)
    );
  },
  isInFilteredRoute(order) {
    if (!this.searchRoute) return true;
    const search = this.searchRoute.toLowerCase();
    return (
      order.name.toLowerCase().includes(search) ||
      order.code.toLowerCase().includes(search) ||
      order.addr.toLowerCase().includes(search)
    );
  },

  generateVroomDataForManualRoute(warehouse, orders) {
  // Плейсхолдер для агента
  const vehicle = {
    id: 1, // Уникальный идентификатор
    start: [warehouse.lon_x, warehouse.lat_y],
    capacity: [9999 * 1000, 9999 * 1000], // Максимальный вес и объем
    time_window: [
      this.convertVehicleToUnix(this.filterDate + ' 06:00:00'),
      this.convertVehicleToUnix(this.filterDate + ' 18:00:00')
    ],
    max_tasks: 99,
    max_distance: 999 * 1000,
    speed_factor: 0.63,
  };

  // Собираем заказы
  const jobs = orders.map(order => {
    const timeWindowBegin = this.convertOrderToUnix(order.plan_time_begin);
    const timeWindowEnd = this.convertOrderToUnix(order.plan_time_end);

    return {
      id: Number(order.pk),
      description: order.name,
      service: order.plan_time_unload * 60, // Переводим минуты в секунды
      location: [order.plan_lon_x, order.plan_lat_y],
      time_windows: [
        [timeWindowBegin, timeWindowEnd]
      ],
      delivery: [order.weight * 1000, order.volume * 1000], // Вес и объем
    };
  });

  return {
    vehicles: [vehicle],
    jobs: jobs,
    options: { g: true }
  };
},

async processVroomManualRouteResponse(data, warehouse, routePk = null) {
  if (!data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
    console.error('Нет маршрутов в ответе VROOM');
    return;
  }

  const vroomRoute = data.routes[0];

  // Формируем данные маршрута для сохранения
  const routeData = {
    name: this.newRouteName,
    code: this.newRouteName,
    begin_time: this.unixToTimestamp(this.getStartArrival(vroomRoute.steps)),
    end_time: this.unixToTimestamp(this.getEndArrival(vroomRoute.steps)),
    plan_route_length: (vroomRoute.distance / 1000).toFixed(2),
    duration: this.secondsToTime(vroomRoute.duration + vroomRoute.service),
    geometry: vroomRoute.geometry,
    color: this.isEditingRoute ? this.currentRoute.color : this.generateRandomColor(),
    cost: vroomRoute.cost,
    //pk_stock: warehouse.gid, // Привязываем маршрут к складу
    // Добавьте другие необходимые поля
  };

  try {
    let route;

    if (this.isEditingRoute && routePk) {
      // Обновляем существующий маршрут
      const response = await axios.put(`http://185.155.18.145:15777/api/routes/${routePk}`, routeData);
      route = response.data;

      // Сбрасываем заказы, которые были в маршруте, но удалены
      const originalOrderPks = this.filteredOrders
        .filter(order => order.pk_route === routePk)
        .map(order => order.pk);
      const updatedOrderPks = vroomRoute.steps
        .filter(step => step.type === 'job')
        .map(step => step.job);
      const ordersToReset = originalOrderPks.filter(pk => !updatedOrderPks.includes(pk));

      for (const orderPk of ordersToReset) {
        await axios.put(`http://185.155.18.145:15777/api/orders/${orderPk}`, {
          pk_route: null,
          free: 1,
          route_num: null,
          plan_time_arrival: null,
        });
      }

    } else {
      // Создаём новый маршрут
      const response = await axios.post('http://185.155.18.145:15777/api/routes', routeData);
      route = response.data;
    }

    // Обновляем заказы в маршруте
    let stepNumber = 1;
    for (const step of vroomRoute.steps) {
      if (step.type === 'job') {
        const orderId = step.job;
        const arrival = this.unixToTimestamp(step.arrival);

        // Обновляем заказ на сервере
        await axios.put(`http://185.155.18.145:15777/api/orders/${orderId}`, {
          pk_route: route.pk,
          free: 0,
          route_num: stepNumber,
          plan_time_arrival: arrival,
        });

        stepNumber++;
      }
    }
  } catch (error) {
    console.error('Ошибка при сохранении маршрута и заказов:', error);
    throw error;
  }
},

openEditRouteDialog(route) {
    this.isEditingRoute = true;
    this.currentRoute = route;
    this.newRouteName = route.name;
   
    
    // Получаем заказы в маршруте
    this.routeOrders = this.filteredOrders
    .filter(order => String(order.pk_route) === String(route.pk))
    .map(order => ({ ...order }));
    
    // Получаем свободные заказы, исключая те, что уже в маршруте
    const routeOrderPks = this.routeOrders.map(order => order.pk);
    this.availableOrders = this.filteredOrders
      .filter(order => order.free === 1 && !routeOrderPks.includes(order.pk))
      .map(order => ({ ...order }));
    
    // Открываем диалог
    this.routeBuilderDialog = true;
  },

  closeRouteBuilderDialog() {
    this.routeBuilderDialog = false;
  },
    
  resetRouteBuilderDialogState() {
    this.isEditingRoute = false;
    this.currentRoute = null;
    this.newRouteName = '';
    this.selectedWarehouse = null;
    this.availableOrders = [];
    this.routeOrders = [];
    this.searchAvailable = '';
    this.searchRoute = '';
    this.updateMapMarkers();
    this.resetSelectedMarkers(); // Сбрасываем выделенные маркеры
    // Reset other variables if necessary
  },



  // Показ карты
  showMap(mapId) {
    const mapElement = document.getElementById(mapId);
    if (mapElement) {
      mapElement.style.display = 'block';
    }
  },

  // Скрытие карты
  hideMap(mapId) {
    const mapElement = document.getElementById(mapId);
    if (mapElement) {
      mapElement.style.display = 'none';
    }
  },

  
  toggleZones() {
    this.zonesVisible = !this.zonesVisible;
    if (this.zonesVisible) {
      this.displayZonesOnMap();
    } else {
      this.clearZonePolygons();
    }
  },
  async fetchZones() {
    try {
      const response = await axios.get('http://185.155.18.145:15777/api/zones');
      this.zones = response.data;
    } catch (error) {
      console.error('Ошибка при загрузке зон:', error);
    }
  },
  displayZonesOnMap() {
  this.clearZonePolygons();
  for (const zone of this.zones) {
    if (!zone.geometry || !zone.geometry.coordinates) {
      console.warn('Zone geometry is missing:', zone);
      continue;
    }

    let coordinates = zone.geometry.coordinates;

    // Проверяем тип геометрии
    if (zone.geometry.type === 'MultiPolygon') {
      // Берём первый полигон
      coordinates = zone.geometry.coordinates[0];
    }

    // Проверяем формат координат
    if (!Array.isArray(coordinates[0][0])) {
      // Оборачиваем в массив, если нужно
      coordinates = [coordinates];
    }

    console.log('Zone coordinates:', coordinates);

    const polygon = new mapgl.Polygon(this.map, {
      coordinates: coordinates,
      color: 'rgba(0, 150, 136, 0.3)',
      strokeColor: '#009688',
      strokeWidth: 2,
    });
    this.zonePolygons.push(polygon);
  }
},
  clearZonePolygons() {
    for (const polygon of this.zonePolygons) {
      polygon.destroy();
    }
    this.zonePolygons = [];
  },

  assignZonesToOrders() {
  // Проверяем, загружены ли зоны
  if (!this.zones || this.zones.length === 0) {
    alert('Зоны не загружены. Пожалуйста, загрузите зоны перед назначением.');
    return;
  }

  // Итерируем по всем заказам
  for (const order of this.filteredOrders) {
    const orderPoint = turf.point([order.plan_lon_x, order.plan_lat_y]);

    let assignedZoneId = null;
    let assignedZoneName = null;

    // Итерируем по всем зонам
    for (const zone of this.zones) {
      let zonePolygon;

      if (zone.geometry.type === 'Polygon') {
        // Проверяем и замыкаем кольца
        const fixedCoordinates = zone.geometry.coordinates.map(ring => {
          const firstCoord = ring[0];
          const lastCoord = ring[ring.length - 1];
          if (firstCoord[0] !== lastCoord[0] || firstCoord[1] !== lastCoord[1]) {
            return [...ring, firstCoord];
          } else {
            return ring;
          }
        });

        zonePolygon = turf.polygon(fixedCoordinates);
      } else if (zone.geometry.type === 'MultiPolygon') {
        const fixedCoordinates = zone.geometry.coordinates.map(polygon => {
          return polygon.map(ring => {
            const firstCoord = ring[0];
            const lastCoord = ring[ring.length - 1];
            if (firstCoord[0] !== lastCoord[0] || firstCoord[1] !== lastCoord[1]) {
              return [...ring, firstCoord];
            } else {
              return ring;
            }
          });
        });

        zonePolygon = turf.multiPolygon(fixedCoordinates);
      } else {
        console.warn(`Неизвестный тип геометрии зоны: ${zone.geometry.type}`);
        continue;
      }

      // Проверяем, находится ли точка внутри полигона
      if (turf.booleanPointInPolygon(orderPoint, zonePolygon)) {
        assignedZoneId = zone.pk; // Заменяем zone.id на zone.pk
        assignedZoneName = zone.name;
        break; // Останавливаем поиск после первой найденной зоны
      }
    }

    // Обновляем поля pk_zone и zone_name у заказа напрямую
    order.pk_zone = assignedZoneId;
    order.zone_name = assignedZoneName || 'Нет зоны';
  }

  // После обновления заказов на клиенте, отправляем изменения на сервер
  this.saveOrdersZoneAssignment();
},



  async saveOrdersZoneAssignment() {
    // Формируем массив заказов с изменённым pk_zone
    const ordersToUpdate = this.filteredOrders.map(order => ({
      pk: order.pk,
      pk_zone: order.pk_zone,
    }));
    console.log('Отправляемые данные:', ordersToUpdate); // Добавьте это для отладки
    try {
      // Отправляем данные на сервер
      await axios.post('http://185.155.18.145:15777/api/orders/update_zones', ordersToUpdate);

      this.showSnackbar('Зоны успешно назначены заказам.');
    } catch (error) {
      console.error('Ошибка при сохранении привязки зон к заказам:', error);
      this.showSnackbar('Произошла ошибка при сохранении зон заказов.');
    }
  },

  async fetchAgentZones(agentId) {
  try {
    const response = await axios.get(`http://185.155.18.145:15777/api/agents/${agentId}/zones`);
    const agent = this.agents.find(a => a.pk === agentId);
    if (agent) {
      agent.zones = response.data.map(zone => zone.pk);
    }
  } catch (error) {
    console.error('Ошибка при получении зон агента:', error);
  }
},


  async fetchSkills() {
    try {
      const response = await axios.get('http://185.155.18.145:15777/api/skills');
      this.skills = response.data;
    } catch (error) {
      console.error('Ошибка при получении навыков:', error);
    }
  },

  async fetchWorkTypes() {
    try {
      const response = await axios.get('http://185.155.18.145:15777/api/worktype'); // Замените URL на ваш
      this.workTypes = response.data.map(type => ({
        ...type,
        pk: String(type.pk) // Приводим pk к строке
      }));
      console.log('Work Types загружены:', this.workTypes); // Для отладки
    } catch (error) {
      console.error('Ошибка при получении типов работ:', error);
    }
  },


  async fetchAgentSkills(agentId) {
  try {
    const response = await axios.get(`http://185.155.18.145:15777/api/agents/${agentId}/skills`);
    const agent = this.agents.find(a => a.pk === agentId);
    if (agent) {
      agent.skills = response.data.map(skill => skill.pk);
    }
  } catch (error) {
    console.error('Ошибка при получении навыков агента:', error);
  }
},

  async saveAgentSkills(agent) {
    try {
      await axios.post(`http://185.155.18.145:15777/api/agents/${agent.pk}/skills`, {
        skills: agent.skills,
      });
      this.showSnackbar('Навыки агента успешно сохранены.');
    } catch (error) {
      console.error('Ошибка при сохранении навыков агента:', error);
      this.showSnackbar('Произошла ошибка при сохранении навыков агента.');
    }
  },

  async saveAgentZones(agent) {
    try {
      await axios.post(`http://185.155.18.145:15777/api/agents/${agent.pk}/zones`, {
        zones: agent.zones,
      });
      this.showSnackbar('Зоны агента успешно сохранены.');
    } catch (error) {
      console.error('Ошибка при сохранении зон агента:', error);
      this.showSnackbar('Произошла ошибка при сохранении зон агента.');
    }
  },


  getSkillNameById(skillId) {
    const skill = this.skills.find(skill => skill.pk === skillId);
    return skill ? skill.name : `Unknown (${skillId})`;
  },

  getWorkTypeNameById(workTypeId) {
    const workType = this.workTypes.find(type => type.pk === String(workTypeId));
    console.log(`Ищем workType для ID: ${workTypeId} ->`, workType);
    return workType ? workType.worktype : `Неизвестный тип (${workTypeId})`;
  },
  openRouteTimelineDrawer(route) {
    this.selectedRouteForTimeline = route;
    this.routeTimelineDrawer = true;
  },

 // Добавьте этот метод для форматирования времени, если его нет
formatDateTime(dateTime) {
  if (!dateTime) return '';
  return moment(dateTime).format('DD.MM.YYYY, HH:mm');
},

handleOrderCreated(newOrder) {
  // Форматируем время заказа
  newOrder.plan_time_begin = this.formatDateTime(newOrder.plan_time_begin);
  newOrder.plan_time_end = this.formatDateTime(newOrder.plan_time_end);

  // Добавляем новый заказ в filteredOrders
  this.filteredOrders.push({
    ...newOrder,
    is_select: false,
  });

  // Обновляем маркеры на карте
  this.updateMapMarkers();
},
createFreeOrderMarker(order) {
  const pkString = String(order.pk);
  const iconUrl = order.is_select ? markerSelectUrl : markerDefaultUrl;

  const marker = new mapgl.Marker(this.map, {
    coordinates: [order.plan_lon_x, order.plan_lat_y],
    icon: iconUrl,
    size: [30, 30],
    zIndex: 10,
  });

  // Добавляем обработчики событий маркера (если необходимо)
  // ...

  this.freeOrderMarkers[pkString] = marker;
},
handleOrderDeleted(deletedOrderPk) {
  // Удаляем заказ из filteredOrders
  const index = this.filteredOrders.findIndex(order => order.pk === deletedOrderPk);
  if (index !== -1) {
    // Удаляем маркер с карты
    const pkString = String(deletedOrderPk);
    if (this.freeOrderMarkers[pkString]) {
      this.freeOrderMarkers[pkString].destroy();
      delete this.freeOrderMarkers[pkString];
    }

    // Удаляем заказ из массива
    this.filteredOrders.splice(index, 1);
  }

  // Обновляем таблицу заказов, если необходимо
  // Если вы используете сортировку или фильтрацию, возможно, потребуется обновить их
},

handleRouteDeleted(deletedRoutePk) {
  // Удаляем маршрут из списка маршрутов
  const routeIndex = this.routes.findIndex(route => route.pk === deletedRoutePk);
  if (routeIndex !== -1) {
    const route = this.routes[routeIndex];

    // Удаляем полилинию маршрута с карты
    this.removeRouteOnMap(route);

    // Удаляем маршрут из массива
    this.routes.splice(routeIndex, 1);
  }

  // Сбрасываем связанные заказы
  this.filteredOrders.forEach(order => {
    if (String(order.pk_route) === String(deletedRoutePk)) {
      // Сбрасываем поля заказа
      order.free = 1;
      order.pk_route = null;
      order.pk_agent = null;
      order.route_num = null;
      order.plan_time_arrival = null;

      // Обновляем маркер заказа
      this.updateSingleMarker(order);
    }
  });

  // Обновляем маркеры на карте
  this.updateMapMarkers();

  // Обновляем таблицу заказов, если необходимо
},



handleRouteCreated(newRoute) {
  // Форматируем время начала и конца
  newRoute.begin_time = this.formatDateTime(newRoute.begin_time);
  newRoute.end_time = this.formatDateTime(newRoute.end_time);

  // Добавляем новый маршрут в список маршрутов
  this.routes.push({
    ...newRoute,
    is_select: false, // Установите по необходимости
  });

  // Обновляем заказы, связанные с маршрутом
  if (newRoute.orders && Array.isArray(newRoute.orders)) {
    newRoute.orders.forEach(updatedOrder => {
      const index = this.filteredOrders.findIndex(order => order.pk === updatedOrder.pk);
      if (index !== -1) {
        this.$set(this.filteredOrders, index, {
          ...this.filteredOrders[index],
          ...updatedOrder,
        });
        // Обновляем маркер заказа
        this.updateRouteOrderMarkerSelection(updatedOrder);
      } else {
        // Добавляем заказ в filteredOrders, если его нет
        this.filteredOrders.push({
          ...updatedOrder,
          is_select: false,
        });
      }
    });
  }

  // Отображаем маршрут на карте, если он выбран
  if (newRoute.is_select) {
    this.displayRouteOnMap(newRoute);
  }
},


},

mounted() {
    this.initMap();
    this.applyDateFilter();
    this.fetchAgents(); // Загружаем агентов при загрузке компонента
  document.addEventListener('keydown', this.onGlobalKeyDown);
  document.addEventListener('keyup', this.onGlobalKeyUp);
    window.addEventListener('resize', this.onWindowResize); // Добавлено
     // Инициализация массива полилиний
    this.polylines = [];
    this.selectAllColumns();
    this.fetchZones();
    this.fetchSkills(); 
    this.fetchWorkTypes();

    socket.on('orderCreated', this.handleOrderCreated);

    
    // В mounted()
    socket.on('orderDeleted', (data) => {
  console.log('data.clientId:', data.clientId);
  console.log('this.clientId:', this.clientId);
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.on('ordersBatchUpdated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.on('orderUpdated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.on('routeDeleted', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.on('routesBatchDeleted', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.on('routeCreated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.on('routeUpdated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.on('agentDeleted', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.on('agentCreated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.on('agentUpdated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.on('stockCreated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.on('stockUpdated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.on('stockDeleted', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});


  },

  beforeDestroy() {
  document.removeEventListener('keydown', this.onGlobalKeyDown);
  document.removeEventListener('keyup', this.onGlobalKeyUp);
  window.removeEventListener('resize', this.onWindowResize); // Добавлено
    socket.off('orderCreated', this.handleOrderCreated);
    socket.off('orderDeleted', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.off('ordersBatchUpdated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.off('orderUpdated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.off('routeDeleted', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.off('routesBatchDeleted', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.off('routeCreated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.off('routeUpdated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.off('agentDeleted', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.off('agentCreated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.off('agentUpdated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.off('stockCreated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.off('stockUpdated', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});

socket.off('stockDeleted', (data) => {
  if (data.clientId !== this.clientId) {
    this.applyDateFilter();
  }
});
  }
};
</script>

<style>

#map {
  position: relative; /* Устанавливаем относительное позиционирование для контейнера карты */
}

.tooltip {
  display: none;
  position: fixed;
  pointer-events: none;
  background: #fff;
  padding: 10px;
  border: 1px solid black;
  border-radius: 4px;
}

.selected {
  background-color: #3acfe2;
}

.popup {
  position: absolute;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  min-width: 200px;
  display: none;
}

.popup-content {
  padding: 5px;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 1px 2px 0 rgba(38, 38, 38, 0.2);
}

.map-container {
  position: sticky; /* Карта остаётся на месте при прокрутке */
  top: 0;
  width: 100%;
  height: 43vh;
  z-index: 1; /* Чтобы карта была выше таблицы */
}

.drawing-cursor {
  cursor: crosshair;
}


.v-data-table {
  overflow-y: auto;
  font-size: 10px; /* Уменьшение шрифта */
  line-height: 1 !important; /* Снижение высоты строки */
}



.buttons-container {
  position: sticky;
  top: 0;
  z-index: 2; /* Кнопки выше карты */
  background-color: white; /* Чтобы кнопки были на фоне карты */
  padding: 10px;
  display: flex;
  justify-content: space-between;
}

.selected-route {
  background-color: #1b449c !important; /* Светло-голубой фон для выделенных маршрутов */
}

.delete-cursor {
  cursor: crosshair; /* Замените на нужный вам курсор, например, крестик */
}


.filter-buttons {
  display: flex;
  gap: 10px;
}

button.active {
  background-color: #007bff;
  color: white;
}

.statistics-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.statistics-card {
  height: 64px;
  text-align: center;
  margin-right: 4px;
  margin-bottom: 2px;
  
}


.v-data-table-header th,
.v-data-table td {
  padding-top: 1 !important;
  padding-bottom: 1 !important;
  height: 10px !important; /* Минимальная возможная высота */
  font-size: 11px !important;
  line-height: 1;
}

.v-data-table td .v-checkbox {
  align-items: center;
  justify-content: center;
  margin-top: -16px !important; /* Подстройка для чекбоксов */
  margin-bottom: -16px !important;
  
}

.v-data-table td .v-checkbox,
.v-data-table th .v-checkbox {
  transform: scale(0.7); /* Уменьшение чекбокса до 80% */
  
}


.address-cell {
  max-width: 500px; /* Установите желаемую ширину */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.driver-table {
  max-height: 250px; /* Примерно 5 строк, зависит от высоты строки */
  overflow-y: auto;
}


.red-text {
  background-color: rgba(192, 16, 16, 0.699); /* Красный фон для неподходящих по весу или объему водителей */
}

.yellow-text {
  background-color: rgba(248, 248, 80, 0.795); /* Желтый фон для водителей, уже назначенных на маршрут */
}


.d-flex.justify-space-between.align-center {
  margin-top: -3px;
  margin-bottom: 0;
}

.wrap-text {
  white-space: normal;
}
.right-column {
  overflow-x: auto;
}
/* Стили для sticky пагинации */
.sticky-pagination {
  position: sticky;
  bottom: 0;
  background-color: white; /* Или другой фон, подходящий вашему дизайну */
  z-index: 10; /* Убедитесь, что тулбар находится выше других элементов */
}


</style>
