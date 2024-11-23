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
    
        <!-- Слот для строк данных -->
  <template #item="{ item }">
    <tr @dblclick="openEditAgentModal(item)">
      <!-- Чекбокс -->
      <td style="width: 20px;">
        <v-checkbox
          v-model="item.is_select"
          @change="onAgentSelectChange(item)"
          hide-details
          class="pa-ma-0"
        />
      </td>

      <!-- Маршрут -->
      <td>
      <div style="display: flex; flex-direction: column; align-items: flex-start;">
        <template v-if="item.routes.length">
          <v-chip
            v-for="(route, index) in item.routes"
            :key="route.pk || index"
            size="x-small"
            :color="route.route_color || 'grey'"
            class="mr-1 mb-1"
            :class="{ 'glow-effect': isAgentOnDuty(item.pk) }"
            @click="openRouteTimelineDrawer(route.route)"
          >
            {{ route.route_name || 'Нет маршрута' }}
          </v-chip>
        </template>
        <template v-else>
          <v-chip size="x-small" color="grey" class="mr-1">
            Нет маршрута
          </v-chip>
        </template>
      </div>
    </td>

      <!-- Водитель -->
      <td>
        <div style="display: flex; flex-direction: column;">
          <!-- Имя водителя -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px;">{{ item.name }}</span>
            <!-- Кнопки чата и деталей -->
            <div>
              <div class="status-indicators">
            <!-- Online status indicator -->
            <v-tooltip bottom>
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  :color="getOnlineStatusColor(item.last_packet_time)"
                  size="small"
                  class="mr-1"
                >
                  {{ getOnlineStatusIcon(item.last_packet_time) }}
                </v-icon>
              </template>
              <span>{{ getOnlineStatusText(item.last_packet_time) }}</span>
            </v-tooltip>

            <!-- Duty status indicator -->
            <v-tooltip bottom>
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  :color="getDutyStatusColor(item.pk)"
                  size="small"
                  class="mr-1"
                >
                  {{ getDutyStatusIcon(item.pk) }}
                </v-icon>
              </template>
              <span>{{ getDutyStatusText(item.pk) }}</span>
            </v-tooltip>
  <!-- Контейнер для иконок -->
  <div style="display: flex; flex-direction: column; align-items: center;">
  <!-- Иконка чата с тултипом -->
  <v-tooltip bottom>
    <template v-slot:activator="{ props }">
      <v-icon
        v-bind="props"
        color="primary"
        :class="{ 'blinking': item.hasNewMessage }"
        @click="openChat(item)"
      >
        mdi-chat
      </v-icon>
    </template>
    <span>Чат с водителем</span>
  </v-tooltip>

  <!-- Иконка трека водителя с тултипом -->
  <v-tooltip bottom>
    <template v-slot:activator="{ props }">
      <v-icon
        v-bind="props"
        v-if="item && item.pk"
        :color="agentTracks[item.pk] ? 'red' : 'primary'"
        @click="toggleAgentTrack(item)"
        class="mr-1"
      >
        mdi-crosshairs-gps
      </v-icon>
    </template>
    <span>{{ agentTracks[item.pk] ? 'Скрыть трек водителя' : 'Показать трек водителя' }}</span>
  </v-tooltip>

  <!-- Иконка деталей GPS с тултипом -->
  <v-tooltip bottom>
    <template v-slot:activator="{ props }">
      <v-icon
        v-bind="props"
        color="primary"
        @click="openAgentDrawer(item)"
        class="mr-1"
      >
        mdi-map-marker-path
      </v-icon>
    </template>
    <span>Детали GPS</span>
  </v-tooltip>
</div>
</div>
</div>

          </div>
          <!-- Иконки с количеством заказов -->
          <div style="display: flex; align-items: center; margin-top: 5px;">
            <!-- Оставшиеся заказы -->
            <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                  <div class="d-flex align-center" v-bind="props">
                    <v-icon size="small" color="primary" class="mr-1">mdi-truck-delivery</v-icon>
                    <span class="text-caption">{{ item.status1Orders }}</span>
                    <v-icon size="small" color="success" class="mx-1">mdi-check-circle</v-icon>
                    <span class="text-caption">{{ item.status2Orders }}</span>
                    <v-icon size="small" color="error" class="mx-1">mdi-alert-circle</v-icon>
                    <span class="text-caption">{{ item.status6Orders }}</span>
                  </div>
                </template>
                <span>Активные/Выполненные/Проблемные</span>
              </v-tooltip>
          </div>
        </div>
      </td>

    </tr>
  </template>
</v-data-table>
    </div>
    
    
          <!-- Правый столбец с картой и таблицами -->
          <div class="right-column" style="flex: 0 0 77%; display: flex; flex-direction: column; height: 100%;">
    
  

            <!-- Карта -->
            <div class="map-container-track">
              <div id="map" style="width: 100%; height: 100%;"></div>
            </div>
    
            <!-- Отступ -->
            <div style="height: 1px;"></div>
    
            <!-- Таблицы заказов и маршрутов -->
            <div style="display: flex; align-items: center; justify-content: flex-start; flex-wrap: nowrap;">
              <v-toolbar density="compact" height="40" flat color="primary">
                <v-menu
        v-model="datemenu"
        :close-on-content-click="false"
        transition="scale-transition"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            prepend-icon="mdi-calendar"
            color="white"
            variant="text"
            v-bind="props"
          >
            {{ filterDateValue || 'Выберите дату' }}
          </v-btn>
        </template>
        <v-locale-provider locale="ru">
          <v-date-picker 
            show-adjacent-months 
            first-day-of-week="1" 
            :hide-header="true"
            color="primary"
            @update:modelValue="onDateSelected"
          ></v-date-picker>
        </v-locale-provider>
      </v-menu>
              <v-tabs v-model="activeTab" >
                <v-tab value="orders"  density="compact"  size="small" :slim="true" slider-color="orange">Заказы</v-tab>
                <v-tab value="alerts" density="compact"  size="small" :slim="true" slider-color="orange">Оповещения</v-tab>
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
    <v-select
        v-model="selectedStatuses"
        :items="statusDescriptions"
        item-title="description"
        item-value="pk"
        label="Статусы"
        multiple
        chips
        variant="plain"
        density="compact"
        hide-details
        class="status-filter"
      >
        <template v-slot:selection="{ item }">
          <v-chip
            size="small"
            :color="getStatusColor(item.status)"
            class="mr-1"
          >
            {{ item.title }}
          </v-chip>
        </template>
      </v-select>
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
          <td v-if="visibleOrderColumns.includes('status')">

    <v-chip :color="getStatusColor(item.status)"   density="compact"  size="x-small">
          {{ getStatusDescriptionById(item.status) }}
        </v-chip>
</td>
<td v-if="visibleOrderColumns.includes('fact_time_moveto')">     <div class="address-cell">
              <div style="display: flex; align-items: center;">{{ item.fact_time_moveto }} </div>
            </div></td>
<td v-if="visibleOrderColumns.includes('fact_time_start')">     <div class="address-cell">
              <div style="display: flex; align-items: center;">{{ item.fact_time_start }} </div>
            </div></td>
<td v-if="visibleOrderColumns.includes('fact_time_close')">     <div class="address-cell">
              <div style="display: flex; align-items: center;">{{ item.fact_time_close }} </div>
            </div></td>
<td v-if="visibleOrderColumns.includes('fact_time_unload')">
  {{ item.time_unload ? item.time_unload + ' мин' : '' }}
</td>
<td v-if="visibleOrderColumns.includes('time_issues')">
  <v-chip v-if="item.time_issues" :color="item.time_issues.color"  density="compact"  size="x-small">
    {{ item.time_issues.text }}
  </v-chip>
</td>
            <td v-if="visibleOrderColumns.includes('problem_description')">{{ item.problem_description }}</td>
            <td v-if="visibleOrderColumns.includes('route_name')"> <div class="address-cell" >{{ item.route_name }} </div></td>
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
      <v-window-item value="alerts" transition="false" reverse-transition="false">
        
    <div class="alerts-panel">
      <v-data-table
        :headers="Alertheaders"
        :items="paginatedAlerts"
        :search="searchQuery"
        :height="computedTableHeight"
        density="compact"
        class="elevation-1"
        :fixed-header="true"
        :multi-sort="true"
        :hover="true"
        items-per-page="100"
        :hide-default-footer="true"
        :items-per-page-options="[
              { value: 100, title: '100' },
              { value: 250, title: '250' },
              { value: 500, title: '500' }
            ]"
            items-per-page-text="Элементов на странице"
            dense
        @click:row="handleRowClick"
      >
        <!-- Table Top Toolbar -->
        <template v-slot:top>
          <v-toolbar density="compact" color="primary">
            <!-- Filter Chips -->
            <div class="d-flex flex-wrap gap-2 mx-4">
              <v-chip
                v-for="type in alertTypes"
                :key="type.value"
                :color="selectedTypes.includes(type.value) ? 'green' : 'default'"
                :variant="selectedTypes.includes(type.value) ? 'elevated' : 'outlined'"
                class="ma-1"
                filter
                @click="toggleFilter(type.value)"
              >
                {{ type.title }}
              </v-chip>
            </div>

            <v-switch
              v-model="showOnMap"
              label="Показать на карте"
              color="white"
              hide-details
              density="compact"
              class="ml-4"
            ></v-switch>
          </v-toolbar>
        </template>

        <template v-slot:item.type="{ item }">
          <v-chip
            :color="getAlertTypeColor(item.type)"
            size="small"
            class="text-caption"
          >
            {{ getAlertTypeName(item.type) }}
          </v-chip>
        </template>

        <template v-slot:item.task_code="{ item }">
          <v-btn
            v-if="item.task_code"
            variant="text"
            density="compact"
            @click.stop="openEditOrderModal(item.pk_task_link)"
          >
            {{ item.task_code }}
          </v-btn>
          <span v-else>-</span>
        </template>

        <template v-slot:item.createtime="{ item }">
          {{ formatMessageTime(item.createtime) }}
        </template>
      </v-data-table>
    </div>
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
              @change="onItemsPerPageChange"
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
    <v-dialog v-model="routeNameDialog" max-width="1000">
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

    <v-snackbar
  v-model="snackbar.show"
  :timeout="3000"
  top
  right
  :color="snackbar.color"
>
  {{ snackbar.message }}

  <template v-slot:actions>
    <!-- Кнопка "Открыть чат" отображается только если есть pk_agent -->
    <div v-if="snackbar.pk_agent">
      <v-btn
        color="white"
        variant="text"
        @click="openChatFromSnackbar"
      >
        Открыть чат
      </v-btn>
    </div>
    <v-btn
      color="white"
      variant="text"
      @click="snackbar.show = false"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </template>
</v-snackbar>


    
    
    <v-navigation-drawer
  v-model="routeTimelineDrawer"
  right
  temporary
  width="750"
>
  <v-toolbar flat>
    <v-toolbar-title class="wrap-text">{{ selectedRouteForTimeline ? selectedRouteForTimeline.name : '' }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn icon @click="routeTimelineDrawer = false">
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </v-toolbar>

  <v-divider></v-divider>

  <!-- Таймлайн заказов -->
  <v-timeline side="start" >
    <v-timeline-item
      v-for="order in routeOrders1"
      :key="order.pk"
      :dot-color="getStatusColor(order.status)"
      fill-dot
      elevation="8"
      @click="openEditOrderModal(order)"
      class="cursor-pointer"
      :class="{'red--text': order.time_issues && order.time_issues.text === 'Опоздание'}"
    >

    <template v-slot:opposite>
    <div v-if="order.actual_sequence">
      <strong>Фактическая очередь:</strong> {{ order.actual_sequence }}
    </div>
    <div v-if="order.status">
      <strong>Статус:</strong>      {{ getStatusDescriptionById(order.status) }}
    </div>
    <div v-if="order.fact_time_moveto">
          <strong>Старт выполнения:</strong> {{ order.fact_time_moveto }}<br>
        </div>
        <div v-if="order.fact_time_start">
          <strong>Разгрузка:</strong> {{ order.fact_time_start }}<br>
        </div>
        <div v-if="order.fact_time_close">
          <strong>Закрытие:</strong> {{ order.fact_time_close }}<br>
        </div>
        <div v-if="order.fact_time_unload">
          <strong>Время на разгрузку:</strong> {{ order.fact_time_unload }} минут<br>
        </div>
        <div v-if="order.time_issues">
          <strong>Нарушение времени:</strong> {{ order.time_issues.text }}<br>
        </div>
        <div v-if="order.problem_description">
          <strong>Проблема:</strong> {{ order.problem_description }}<br>
        </div>

  </template>
      <div>
        <strong>Плановая очередь:</strong> {{ order.route_num }}<br>
        <strong>Код клиента:</strong> {{ order.code }}<br>
        <strong>Название:</strong> {{ order.name }}<br>
        <strong>Временное окно:</strong> {{ order.plan_time_begin }} - {{ order.plan_time_end }}<br>
       

        <!-- Условно отображаем поля, если они существуют -->
     
      </div>
    </v-timeline-item>
  </v-timeline>
</v-navigation-drawer>


<v-dialog v-model="chatDialog" max-width="800px">
  <v-card class="chat-card">
    <!-- Header -->
    <v-toolbar color="primary" class="chat-header">
      <div class="d-flex align-center header-content">
        <v-avatar size="36" color="white" class="avatar">
          <span class="text-primary">{{ selectedAgentForChat.name.charAt(0) }}</span>
        </v-avatar>
        <v-toolbar-title class="text-white ml-3">
          {{ selectedAgentForChat.name }}
          <div class="text-caption">{{ selectedAgentForChat.role || 'Агент' }}</div>
        </v-toolbar-title>
      </div>
      <v-spacer></v-spacer>
      <v-btn icon color="white" @click="chatDialog = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
   

    <!-- Messages Area -->
    <div ref="messagesContainer" class="messages-container">
      <div
        v-for="message in chatMessages"
        :key="message.id || message.file_name"
        class="message-wrapper"
        :class="{ 'message-right': isMyMessage(message) }"
              >
                <div class="message-content" :class="{ 'my-message': isMyMessage(message) }">
          <div 
            class="message-bubble"
            :class="{
      'my-bubble': isMyMessage(message),
      'other-bubble': !isMyMessage(message),
      'reaction-border-green': message.type === 1,
      'reaction-border-yellow': message.type === 2,
      'reaction-border-red': message.type === 3
    }"
          >
            <!-- Reaction Icon -->
            <v-icon
              v-if="message.type !== 0"
              :color="getReactionColor(message.type)"
              class="reaction-icon"
              size="small"
            >
              {{ getReactionIcon(message.type) }}
            </v-icon>

                    <!-- File Message -->
            <div v-if="message.isFile" class="file-attachment">
              <div v-if="isImageFile(message.file_name)" class="file-preview">
                <v-img
                  :src="message.url"
                  max-height="200"
                  cover
                  class="rounded-lg"
                ></v-img>
              </div>
              <div class="file-info">
                <v-icon class="mr-2">mdi-file</v-icon>
                <div class="file-details">
                  <a :href="message.url" target="_blank" class="file-name">
                    {{ message.file_name }}
                  </a>
                  <div class="file-size" v-if="message.size">
                    {{ formatFileSize(message.size) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Text Message -->
            <div v-else class="message-text">
              {{ message.txt }}
            </div>

            <div class="message-meta">
    <span class="message-time">{{ formatMessageTime(message.createtime) }}</span>
</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <v-card-actions class="chat-input">
      <v-text-field
        v-model="newMessage"
        placeholder="Введите сообщение..."
        variant="outlined"
        density="comfortable"
        hide-details
        class="message-input mr-2"
        @keyup.enter="sendMessage"
      >
        <template #append-inner>
          <v-btn
            icon
            variant="text"
            size="small"
            color="primary"
            @click="openFilePicker"
            class="mr-2"
          >
            <v-icon>mdi-paperclip</v-icon>
          </v-btn>
        </template>
      </v-text-field>
      <v-menu>
  <template v-slot:activator="{ props }">
    <v-btn
      icon
      variant="text"
      size="small"
      color="primary"
      v-bind="props"
    >
      <v-icon>mdi-emoticon</v-icon>
    </v-btn>
  </template>
  <v-list>
    <v-list-item
      v-for="(reaction, index) in reactions"
      :key="index"
      @click="selectedReaction = reaction.type"
    >
      <v-list-item-title>
        <v-icon :color="reaction.color">{{ reaction.icon }}</v-icon>
        {{ reaction.label }}
      </v-list-item-title>
    </v-list-item>
  </v-list>
</v-menu>

      <v-btn
        color="primary"
        icon
        @click="sendMessage"
        :disabled="!newMessage.trim()"
      >
        <v-icon>mdi-send</v-icon>
      </v-btn>

      <input
        ref="fileInput"
        type="file"
        @change="uploadFiles"
        style="display: none"
        multiple
        accept="image/*,application/pdf,video/*"
      >
    </v-card-actions>
  </v-card>
</v-dialog>


<v-bottom-sheet
  v-model="agentDrawer"
  :max-height="'40vh'"
  inset
  persistent
>
  <v-toolbar dense flat>
    <v-toolbar-title>{{ selectedAgent?.name || 'Детали агента' }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn icon @click="closeAgentDrawer">
  <v-icon>mdi-close</v-icon>
</v-btn>
  </v-toolbar>

  <v-card flat>
    <v-card-text style="overflow-y: auto; max-height: calc(40vh - 64px);">
      <div v-if="loadingAgentTrack">
    <v-progress-circular indeterminate></v-progress-circular>
  </div>
  <div v-else>
    <div v-if="agentTrackPoints.length === 0">
      Нет данных GPS трека для данного агента.
    </div>
    <div v-else>
      <div class="d-flex justify-space-between">
    <div>
      <div class="text-subtitle-2">Общая дистанция</div>
      <div class="text-h6">{{ totalDistance }} км</div>
    </div>
    <div>
      <div class="text-subtitle-2">Время в пути</div>
      <div class="text-h6">{{ totalDuration }}</div>
    </div>
    <div>
      <div class="text-subtitle-2">Средняя скорость</div>
      <div class="text-h6">{{ avgSpeed }} км/ч</div>
    </div>
  </div>
      <!-- Отображение деталей GPS трека -->
      <v-simple-table>
    <thead>
      <tr>
        <th>Время</th>
        <th>Координаты</th>
        <th>Скорость (км/ч)</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(point, index) in agentTrackPoints"
        :key="index"
        @click="highlightPointOnMap(point)"
        style="cursor: pointer;"
      >
        <td>{{ formatDateTime(point.point_time) }}</td>
        <td>{{ point.lat_y }}, {{ point.lon_x }}</td>
        <td>{{ point.speed || 0 }}</td>
      </tr>
    </tbody>
  </v-simple-table>
    </div>
  </div>
    </v-card-text>
  </v-card>
</v-bottom-sheet>
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
    import draggable from 'vuedraggable'
    import socket from '@/socket';
    import { v4 as uuidv4 } from 'uuid';
    //import { useDataStore } from '@/stores/dataStore';
    import { kml } from '@tmcw/togeojson'; // Используем togeojson для парсинга KML
    
  
    // Импорт статических SVG-маркеров
    import markerDefault from "@/assets/marker_default.svg?url";
import markerSelect from "@/assets/marker_select_tracking.svg?url";
import markerdragorder from "@/assets/marker_hover.svg";
import markerStatus1Url from "@/assets/marker_status_1.svg?url";
import markerStatus2Url from "@/assets/marker_status_2.svg?url";
import markerStatus3Url from "@/assets/marker_status_3.svg?url";
import markerStatus4Url from "@/assets/marker_status_4.svg?url";
import markerStatus5Url from "@/assets/marker_status_5.svg?url";
import markerStatus6Url from "@/assets/marker_status_6.svg?url";
import markeragent from "@/assets/agent.svg?url";
import markergps from "@/assets/marker_GPS.svg?url";
import markeralert1 from "@/assets/marker_alert_type1.svg?url";
import markeralert2 from "@/assets/marker_alert_type2.svg?url";
import markeralert3 from "@/assets/marker_alert_type3.svg?url";

    
    // Импорт склада
    import warehouseMarker from '@/assets/warehouse.png'; // Импорт маркера склада
import { color } from "d3";

    // Получаем базовый URL приложения
    const appHost = window.location.origin;
    
    // Формируем абсолютные пути к иконкам
    const markeragentUrl = `${appHost}${markeragent}`;
    const markergpsUrl = `${appHost}${markergps}`;
    const markeralert1Url = `${appHost}${markeralert1}`;
    const markeralert2Url = `${appHost}${markeralert2}`;
    const markeralert3Url = `${appHost}${markeralert3}`;
    const markerDefaultUrl = `${appHost}${markerDefault}`;
    const markerSelectUrl = `${appHost}${markerSelect}`;
    const markerdragorderUrl = `${appHost}${markerdragorder}`; // Формируем URL иконки
    const markerStatusUrls = {
  1: markerStatus1Url,
  2: markerStatus2Url,
  3: markerStatus3Url,
  4: markerStatus4Url,
  5: markerStatus5Url,
  6: markerStatus6Url,
};
    
    
    
    
    export default {
      name: 'fact',
      components: {
        draggable,
      },
      data() {
        return {
          orders: [],
          filterDate: this.getCurrentDate(),
          filterDateValue: '',
          filteredOrders: [],
          allOrders: [],
          datemenu: false,
          drag: false,
          currentPage: 1,
          itemsPerPage: 100,
          clientId: '',
          selectedStatuses: [],
          headersorders: [  
            { title: '', value: 'is_select', sortable: false }, // Столбец для чекбоксов
            { title: "Код", value: "code" , sortable: true},
            { title: "Имя", value: "name", sortable: true },
            { title: "Адрес", value: "addr", sortable: true },
            { title: "Планновое время старта", value: "plan_time_begin", sortable: true },
            { title: "Планновое время конца", value: "plan_time_end" , sortable: true},
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
            { title: "ETA", value: "plan_time_arrival", sortable: true },
            { title: "Водитель", value: "driver_name", sortable: true },
            { title: "Требования", value: "skills", sortable: true },
            { title: "Статус", value: "status", sortable: true },
            { title: "Старт выполнения", value: "fact_time_moveto", sortable: true },
            { title: "Разгрузка", value: "fact_time_start", sortable: true },
            { title: "Закрытие", value: "fact_time_close", sortable: true },
            { title: "Время на разгрузку", value: "fact_time_unload", sortable: true },
            { title: "Нарушение времени", value: "time_issues", sortable: true },
            { title: "Проблема", value: "problem_description", sortable: true },
            { title: "Маршрут", value: "route_name", sortable: true },
           

          ],
          visibleOrderColumns: [
          ],
          isMenuOpen: false,
          map: null,
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
          deleteConfirmationDialog: false,
          deleteRoutesConfirmationDialog: false,
          markerMap: {} ,// Новый объект для маппинга заказов и маркеров
          stocks: [], // Данные по складам
          agents: [], // Список агентов
          selectedAgents: [], // Массив выбранных агентов
          selectedRoutes: [],
          skills: [],
          workTypes: [],
          statusDescriptions: [],
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
          { title: 'Маршрут', value: 'route_name',   sortable: true },
          { title: 'Имя', value: 'name', sortable: true },// Новый столбец для маршрута

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
        activeTab: 'orders', // Индекс активной вкладки (0 - Заказы, 1 - Маршруты)
        activeTab1: 'tracking',
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
        chatDialog: false,
        chatTab: null,
        selectedAgentForChat: null,
        chatMessages: [],
        chatFiles: [],
        newMessage: '',
        selectedReaction: 0, // по умолчанию 0 - без реакции
        selectedReactionType: 0, //
        reactions: [
      { type: 1, icon: 'mdi-emoticon-happy', color: 'green', label: 'Хорошо' },
      { type: 2, icon: 'mdi-alert', color: 'yellow', label: 'Внимание' },
      { type: 3, icon: 'mdi-flash', color: 'red', label: 'Срочно' },
    ],
    alertTypes: [
  { value: 1, title: 'Успешно', color: 'success' },
  { value: 2, title: 'Предупреждение', color: 'warning' },
  { value: 3, title: 'Проблема', color: 'error' }
],
    agentLocations: {}, // Store agent locations
      locationUpdateInterval: null,
      shiftStatus: {}, // Store agent shift status
      agentTracks: {},
      agentDrawer: false,
    selectedAgent: null,
    agentTrackPoints: [],
    agentTrackPolyline: null,
    loadingAgentTrack: false,
    totalDistance: 0,
    totalDuration: '0 ч 00 мин',
    avgSpeed: 0,
    highlightMarker: null,
    statusUpdateInterval: null,
    alerts: [],
    alertMarkers: {},
    search: '',
    showOnMap: false,
    selectedTypes: [],
    Alertheaders : [
  { title: 'Тип', key: 'type', sortable: true },
  { title: 'Отправитель', key: 'sender_name', sortable: true },
  { title: 'Сообщение', key: 'txt', sortable: false },
  { title: 'Заказ', key: 'task_code', sortable: true },
  { title: 'Время', key: 'createtime', sortable: true }
],
alertsTotalItems: 0,



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

      paginatedAlerts() {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  const end = this.currentPage * this.itemsPerPage;
  console.log('Пагинация: start:', start, 'end:', end);
  return this.filteredAlerts.slice(start, end);
},

    

pageCount() {
  if (this.activeTab === 'orders') {
    return Math.ceil(this.sortedOrders.length / this.itemsPerPage);
  } else if (this.activeTab === 'alerts') {
    return Math.ceil(this.filteredAlerts.length / this.itemsPerPage); // Используем длину отфильтрованных оповещений
  }
  return 0;
},
    
      isPaginationVisible() {
        return this.activeTab === 'orders' || this.activeTab === 'alerts';
      },

      filteredAlerts() {
  console.log('selectedTypes:', this.selectedTypes);
  console.log('alerts:', this.alerts);

  if (!this.selectedTypes || this.selectedTypes.length === 0) return this.alerts || [];
  return (this.alerts || []).filter(alert => this.selectedTypes.includes(alert.type));
},
        isPlanButtonDisabled() {
        return !this.planningParams.startFromWarehouse && !this.planningParams.returnToStock;
      },
        // Вычисляемое свойство для сортировки заказов
        sortedOrders() {
            let orders = this.computedOrders;

              // Фильтрация по выбранным маршрутам
  if (this.selectedRoutes && this.selectedRoutes.length > 0) {
    const selectedRoutePks = this.selectedRoutes.map(route => String(route.pk));
    orders = orders.filter(order => selectedRoutePks.includes(String(order.pk_route)));
  }
    
            // Применяем фильтр по статусам
    if (this.selectedStatuses.length > 0) {
      orders = orders.filter(order => this.selectedStatuses.includes(order.status));
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
    
      agentsWithRouteInfo() {
  const agentsWithRoutes = this.agents.map(agent => {
    // Находим все маршруты для агента
    const routesForAgent = this.routes.filter(route => String(route.pk_agent) === String(agent.pk));

    // Находим все заказы этого агента
    const ordersInRoute = this.orders.filter(order => String(order.pk_agent) === String(agent.pk));

    // Подсчитываем количество заказов по статусам
    const totalOrders = ordersInRoute.length;
    const status1Orders = ordersInRoute.filter(order => order.status === 1).length;
    const status2Orders = ordersInRoute.filter(order => order.status === 2).length;
    const status6Orders = ordersInRoute.filter(order => order.status === 6).length;
    console.log('Агент перед возвратом:', agent)
    if (routesForAgent.length > 0) {
      return {
        ...agent,
        routes: routesForAgent.map(route => ({
          route_name: route.name,
          route_color: route.color,
          route:route
        })),
        totalOrders,
        status1Orders,
        status2Orders,
        status6Orders,
        // остальная информация...
      };
    }

    return {
      ...agent,
      routes: [], // Пустой массив, если маршрутов нет
      route_name: 'Нет маршрута',
      route_color: null,
      totalOrders,
      status1Orders,
      status2Orders,
      status6Orders,
      // остальная информация...
    };
  });


  // Сортировка остается без изменений
  return agentsWithRoutes.sort((a, b) => {
    if (a.routes.length > 0 && b.routes.length === 0) return -1;
    if (a.routes.length === 0 && b.routes.length > 0) return 1;
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

    const orders = this.computedOrders.filter(
        order => String(order.pk_route) === String(this.selectedRouteForTimeline.pk)
    );

    // Сортируем по фактическому времени закрытия, если оно есть, иначе по route_num
    const actualOrders = orders.slice().sort((a, b) => {
        const timeA = a.fact_time_close ? new Date(a.fact_time_close).getTime() : null;
        const timeB = b.fact_time_close ? new Date(b.fact_time_close).getTime() : null;

        if (timeA !== null && timeB !== null) {
            return timeA - timeB;
        } else if (timeA === null && timeB === null) {
            // Если оба времени отсутствуют, сортируем по route_num
            return (a.route_num || 0) - (b.route_num || 0);
        } else {
            // Если одно время отсутствует, то заказы с временем идут раньше
            return timeA !== null ? -1 : 1;
        }
    });

    // Присваиваем фактическую очередность
    actualOrders.forEach((order, index) => {
        order.actual_sequence = index + 1;
    });

    return actualOrders;
},


      computedOrders() {


    return this.filteredOrders.map(order => {
      // Вычисление времени на разгрузку
      let timeUnload = null;
      if (order.fact_time_close && order.fact_time_start) {
        const closeTime = moment(order.fact_time_close);
        const startTime = moment(order.fact_time_start);
        const duration = moment.duration(closeTime.diff(startTime));
        timeUnload = Math.round(duration.asMinutes()); // Округляем до минут
      }

      // Вычисление нарушения времени
      let timeIssues = null;
      if (order.fact_time_close && order.plan_time_end) {
        const closeTime = moment(order.fact_time_close, 'DD.MM.YYYY, HH:mm');
        const planEndTime = moment(order.plan_time_end, 'DD.MM.YYYY, HH:mm');
        const planStartTime = moment(order.plan_time_begin, 'DD.MM.YYYY, HH:mm');

        if (closeTime.isAfter(planEndTime)) {
          timeIssues = {
            text: 'Опоздание',
            color: 'red',
          };
        } else if (closeTime.isBefore(planStartTime)) {
          timeIssues = {
            text: 'Раннее прибытие',
            color: 'yellow',
          };
        }
      }

      // Находим маршрут по pk_route
      const route = this.routes.find(r => String(r.pk) === String(order.pk_route));
      const routeName = route ? route.name : '';
      const routeColor = route ? route.color : '';

      return {
        ...order,
        time_unload: timeUnload,
        time_issues: timeIssues,
        route_name: routeName,
        routeInfo: route ? { color: routeColor } : null,
      };
    });
  },

  computeAgentOrderCounts() {
  this.agents.forEach(agent => {
    console.log(`Агент: ${agent.name} (pk: ${agent.pk})`);
    // Находим маршруты этого агента
    const agentRoutes = this.routes.filter(route => String(route.pk_agent) === String(agent.pk));

    let totalOrders = 0;
    let remainingOrders = 0;
    let completedOrders = 0;
    let problematicOrders = 0;

    // Если агент имеет маршруты
    if (agentRoutes.length > 0) {
      // Предположим, что используем первый маршрут для отображения
      const primaryRoute = agentRoutes[0];
      agent.routeInfo = {
        color: primaryRoute.color || '#000000',
      };
      agent.routeNames = agentRoutes.map(route => route.name).join(', ');

      agentRoutes.forEach(route => {
        // Находим заказы в этом маршруте
        const ordersInRoute = this.orders.filter(order => String(order.pk_route) === String(route.pk));

        totalOrders += ordersInRoute.length;

        ordersInRoute.forEach(order => {
          if (order.status === 2) {
            completedOrders += 1;
          } else if (order.status === 6) {
            problematicOrders += 1;
          } else {
            remainingOrders += 1;
          }
        });
      });
    } else {
      // Если у агента нет маршрутов
      agent.routeInfo = null;
      agent.routeNames = 'Без маршрута';
    }

    console.log(`Всего заказов: ${totalOrders}`);
    console.log(`Оставшиеся заказы: ${remainingOrders}`);
    console.log(`Завершенные заказы: ${completedOrders}`);
    console.log(`Проблемные заказы: ${problematicOrders}`);
    // Добавляем данные к агенту
    agent.totalOrders = totalOrders;
    agent.remainingOrders = remainingOrders;
    agent.completedOrders = completedOrders;
    agent.problematicOrders = problematicOrders;
  });
},

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
      },

      selectedTypes() {
    if (this.showOnMap) {
      this.displayAlertsOnMap();
    }
  },

  showOnMap(newVal) {
  if (newVal) {
    // Если переключатель включён, показываем алерты на карте
    this.displayAlertsOnMap();
  } else {
    // Если переключатель выключён, удаляем алерты
    this.clearAlerts();
  }
},

  activeTab(newVal, oldVal) {
    this.currentPage = 1;
  },
    },
    
      methods: {
        applyDateFilter() {
          
          if (this.filterDate) {
            const dateObj = new Date(this.filterDate);
            const year = dateObj.getFullYear();
            const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
            const day = ('0' + dateObj.getDate()).slice(-2);
            const formattedDate = `${year}-${month}-${day}`;
            this.fetchOrders({ date: formattedDate,free: 0 });
          } else {
            this.fetchOrders({ free: 0 });
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

  // Удаляем маркеры заказов, связанных с маршрутами
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

  // Не удаляем маркеры свободных заказов
  // Если вы хотите управлять их видимостью, используйте `updateOrderMarkersVisibility`
},

clearAlerts() {
  console.log("Удаляем маркеры алертов", this.alertMarkers);

  for (const alertPk in this.alertMarkers) {
    const markerObj = this.alertMarkers[alertPk];
    if (markerObj && markerObj.marker) {
      console.log("Удаляем маркер:", alertPk);
      markerObj.marker.destroy(); // Обращаемся к свойству marker
    }
  }

  this.alertMarkers = {};
  console.log("Маркер удалён, объект сброшен:", this.alertMarkers);
},

onItemsPerPageChange() {
    this.currentPage = 1; // Сбрасываем на первую страницу
  },
    
      fetchOrders(filter = {}, selectedRoutePks = []) {
  return axios
    .get("http://185.155.18.145:15777/api/orders", { params: filter })
    .then(response => {
      if (response.data && Array.isArray(response.data)) {
        const ordersWithSelection = response.data.map(order => ({
          ...order,
          is_select: false
        }));
        this.filteredOrders = ordersWithSelection;
        this.orders = ordersWithSelection; // Добавлено: сохраняем заказы в this.orders
        this.updateMapMarkers();
      } else {
        this.filteredOrders = [];
        this.orders = []; // Добавлено: очищаем this.orders, если данных нет
      }
    })
    .catch(error => {
      console.error("Ошибка при загрузке заказов:", error);
    });
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
  const ordersToDisplay = this.filteredOrders.filter(order => order.free === 0);

  ordersToDisplay.forEach(order => {
    if (!order.plan_lon_x || !order.plan_lat_y) {
      console.warn(`Пропущены координаты для заказа: ${order.pk}`);
      return;
    }

    const pkString = String(order.pk);
    const status = order.status;
    const iconUrl = markerStatusUrls[status] || markerDefaultUrl;

    if (this.freeOrderMarkers[pkString]) {
      // Update existing marker
      const marker = this.freeOrderMarkers[pkString];
      marker.setIcon({
        icon: iconUrl,
        size: [30, 30],
        zIndex: 10,
      });
    } else {
      // Create new marker
      const marker = new mapgl.Marker(this.map, {
        coordinates: [order.plan_lon_x, order.plan_lat_y],
        icon: iconUrl,
        size: [30, 30],
        zIndex: 10,
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
    // Если тултип не существует, создаём его
    marker.popupHtml = this.createOrderPopupHtml(order);
    this.map.getContainer().appendChild(marker.popupHtml);
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
    const status = order.status;
    const newIconUrl = markerStatusUrls[status] || markerDefaultUrl;

    existingMarker.setIcon({
      icon: newIconUrl,
      size: [30, 30],
      zIndex: 10,
    });

    existingMarker.show();
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

    getStatusDescriptionById(statusId) {
    const status = this.statusDescriptions.find(s => s.pk === statusId);
    return status ? status.description : `Unknown (${statusId})`;
  },

  getStatusColor(statusId) {
    const colors = {
      1: 'grey',
      2: 'green',
      3: 'orange',
      4: 'blue',
      5: 'purple',
      6: 'red',
    };
    const color = colors[statusId] || 'grey';
    console.log(`getStatusColor(${statusId}) = ${color}`);
    return color;
  },
    
  async fetchStatusDescriptions() {
    try {
      const response = await axios.get('http://185.155.18.145:15777/api/statusdesc');
      this.statusDescriptions = response.data;
    } catch (error) {
      console.error('Ошибка при получении описаний статусов:', error);
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
      is_select: agent.is_active || false, // Поле для чекбокса активности
      skills: agent.skills || [],
      zones: agent.zones || [],
      hasNewMessage: false,
    }));
    console.log('Загруженные агенты:', this.agents); // Добавьте это
  } catch (error) {
    console.error('Ошибка при загрузке агентов:', error);
  }
},

async fetchAgentStatuses() {
    try {
      const response = await axios.get('http://185.155.18.145:15777/api/agent-statuses');
      const statuses = response.data;

      // Обновляем `last_packet_time` в `this.agents`
      statuses.forEach(status => {
        const agent = this.agents.find(a => a.pk === status.pk);
        if (agent) {
          agent.last_packet_time = status.last_packet_time;
        }
      });
    } catch (error) {
      console.error('Ошибка при обновлении статусов агентов:', error);
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
    
      onAgentSelectChange(agent) {
        if (agent.is_select) {
    // Добавляем агента в список выбранных, избегая дубликатов
    if (!this.selectedAgents.some(a => a.pk === agent.pk)) {
      this.selectedAgents.push(agent);
    }
  } else {
    // Удаляем агента из списка выбранных
    this.selectedAgents = this.selectedAgents.filter(a => a.pk !== agent.pk);
  }
  // Обновляем отображение маршрутов на карте
  this.updateSelectedAgents();
},

  applyAgentFilter() {
    if (this.selectedAgents.length === 0) {
      // Нет выбранных агентов, показываем все заказы
      this.filteredOrders = [...this.allOrders];
    } else {
      // Фильтруем заказы по выбранным агентам
      const selectedAgentPks = this.selectedAgents.map(agent => String(agent.pk));
      this.filteredOrders = this.allOrders.filter(order =>
        selectedAgentPks.includes(String(order.pk_agent))
      );
    }
  },

  updateSelectedAgents() {
  // Очищаем карту от предыдущих маршрутов
  this.clearMap();

  // Очищаем список выбранных маршрутов
  this.selectedRoutes = [];

  // Отображаем маршруты выбранных агентов
  this.selectedAgents.forEach(agent => {
    const agentRoutes = this.routes.filter(route => String(route.pk_agent) === String(agent.pk));
    
    // Добавляем маршруты в список выбранных маршрутов
    this.selectedRoutes.push(...agentRoutes);

    agentRoutes.forEach(route => {
      // Отображаем маршрут на карте
      this.displayRouteOnMap(route);
    });
  });

  // Зумируем к выбранным маршрутам
  this.zoomToSelectedRoutes();

  // Обновлять таблицу заказов не требуется, так как используем вычисляемое свойство
},




zoomToSelectedRoutes() {
  const allCoordinates = [];

  console.log('Начинаем зумирование. Выбранные агенты:', this.selectedAgents);

  this.selectedAgents.forEach(agent => {
    const agentRoutes = this.routes.filter(route => String(route.pk_agent) === String(agent.pk));

    console.log(`Маршруты агента ${agent.name} (pk: ${agent.pk}):`, agentRoutes);

    agentRoutes.forEach(route => {
      const ordersInRoute = this.orders.filter(order => String(order.pk_route) === String(route.pk));

      console.log(`Заказы в маршруте ${route.name} (pk: ${route.pk}):`, ordersInRoute);

      ordersInRoute.forEach(order => {
        if (order.plan_lon_x && order.plan_lat_y) {
          const lon = parseFloat(order.plan_lon_x);
          const lat = parseFloat(order.plan_lat_y);
          if (!isNaN(lon) && !isNaN(lat)) {
            allCoordinates.push([lon, lat]);
          } else {
            console.warn(`Некорректные координаты у заказа ${order.pk}:`, order.plan_lon_x, order.plan_lat_y);
          }
        } else {
          console.warn(`Отсутствуют координаты у заказа ${order.pk}`);
        }
      });
    });
  });

  if (allCoordinates.length === 1) {
    // Только одна точка, центрируем карту на неё
    console.log('Только одна координата, центрируем карту на:', allCoordinates[0]);
    this.map.setCenter(allCoordinates[0]);
    this.map.setZoom(14); // Установите нужный уровень зума
  } else if (allCoordinates.length > 1) {
    const points = turf.featureCollection(allCoordinates.map(coord => turf.point(coord)));
    const bbox = turf.bbox(points);
    console.log('BBox для зумирования:', bbox);

    if (bbox && bbox.length === 4 && bbox.every(num => typeof num === 'number' && !isNaN(num))) {
      const bounds = {
        southWest: [bbox[0], bbox[1]], // [minLon, minLat]
        northEast: [bbox[2], bbox[3]], // [maxLon, maxLat]
      };
      this.map.fitBounds(bounds, { padding: 200 });
    } else {
      console.error('Некорректный bbox:', bbox);
    }
  } else {
    console.warn('Нет координат для зумирования.');
  }
},


zoomToCoordinates(coordinates) {
  if (coordinates.length === 1) {
    // Только одна точка, центрируем карту на неё
    console.log('Только одна координата, центрируем карту на:', coordinates[0]);
    this.map.setCenter(coordinates[0]);
    this.map.setZoom(14); // Установите нужный уровень зума
  } else if (coordinates.length > 1) {
    const points = turf.featureCollection(coordinates.map(coord => turf.point(coord)));
    const bbox = turf.bbox(points);
    console.log('BBox для зумирования:', bbox);

    if (bbox && bbox.length === 4 && bbox.every(num => typeof num === 'number' && !isNaN(num))) {
      const bounds = {
        southWest: [bbox[0], bbox[1]], // [minLon, minLat]
        northEast: [bbox[2], bbox[3]], // [maxLon, maxLat]
      };
      this.map.fitBounds(bounds, { padding: 50 });
    } else {
      console.error('Некорректный bbox:', bbox);
    }
  } else {
    console.warn('Нет координат для зумирования.');
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
        
        toggleSelectAllAgents() {
          // Логика выбора всех агентов
          this.allAgentsSelected = !this.allAgentsSelected;
          this.agents.forEach(agent => {
            agent.is_select = this.allAgentsSelected;
          });
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
        this.showSnackbar('Водитель успешно добавлен.');
    
      } catch (error) {
        console.error('Ошибка при добавлении водителя:', error);
        this.showSnackbar('Произошла ошибка при добавлении водителя.');
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
    
    async applyDateFilter(selectedRoutePks = []) {
  this.clearMap(); // Очищаем карту от старых полилиний и маркеров
  this.routes = []; // Сбрасываем список маршрутов
  if (this.filterDate) {
    const dateObj = new Date(this.filterDate);
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;
    await this.fetchOrders({ date: formattedDate, free: 0 }, selectedRoutePks);
    await this.fetchRoutes({ date: formattedDate }, selectedRoutePks);
  } else {
    await this.fetchOrders({ free: 0 }, selectedRoutePks);
    await this.fetchRoutes({}, selectedRoutePks);
  }

    // Сбрасываем выбор агентов
    this.agents.forEach(agent => {
    agent.is_select = false;
  });
  await this.loadAlerts();
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
         showSnackbar(message, color = 'primary', pk_agent = null) {
    this.snackbar.message = message;
    this.snackbar.color = color;
    this.snackbar.show = true;
    this.snackbar.pk_agent = pk_agent; // Сохраняем pk_agent для использования при клике
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
    console.log('Открываем деталку маршрута:', route);
    this.selectedRouteForTimeline = route;
    this.routeTimelineDrawer = true;
  },
    
     // Добавьте этот метод для форматирования времени, если его нет
     formatDateTime(dateTime) {
  if (!dateTime) return '';
  return moment.utc(dateTime).local().format('DD.MM.YYYY, HH:mm');
},

    formatTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  return date.toLocaleString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(',', '');
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
    
    openChat(agent) {
        this.selectedAgentForChat = agent;
        this.chatDialog = true;
        this.chatTab = 0;
        this.fetchChatData(agent.pk);
         // Прокручиваем чат вниз для отображения новых сообщений
    setTimeout(() => {
        this.scrollToBottom();
    }, 50);
    },

    openChatFromSnackbar() {
    if (this.snackbar.pk_agent) {
        const agent = this.agents.find(a => String(a.pk) === String(this.snackbar.pk_agent));
        if (agent) {
            this.openChat(agent);
        } else {
            console.warn('Агент с pk_agent:', this.snackbar.pk_agent, 'не найден');
        }
    }
},
formatMessageTime(time) {
        return moment.utc(time).format('DD.MM.YYYY, HH:mm');
    },


fetchChatData(pk_agent) {
    // Получаем сообщения
    const messagesRequest = axios.get('http://185.155.18.145:15777/api/tamsmobile/messages/recivedisp', {
        params: {
            pk_agent: pk_agent,
            date: this.filterDate, // Используйте текущую выбранную дату
        },
    });

    // Получаем файлы
    const filesRequest = axios.get('http://185.155.18.145:15777/api/tamsmobile/chat/files', {
        params: {
            pk_agent: pk_agent,
            date: this.filterDate, // Используйте текущую выбранную дату
        },
    });

    // Ждём выполнения обоих запросов
    Promise.all([messagesRequest, filesRequest])
        .then(([messagesResponse, filesResponse]) => {
            console.log('Сообщения с сервера:', messagesResponse.data);
            console.log('Файлы с сервера:', filesResponse.data);

            const messages = messagesResponse.data;
            const files = filesResponse.data;

            // Преобразуем файлы в формат сообщений с превью
            const fileMessages = files.map(file => {
                return {
                    id: file.id,
                    sender: { id: 'server', name: 'Сервер' }, // Переопределите по необходимости
                    file_name: file.name,
                    sender_name: '', 
                    url: file.url,
                    createtime: file.createtime,
                    isFile: true,
                    fileType: file.name.split('.').pop().toLowerCase(),
                    fileSize: file.size,
                    reaction: null,
                    reciver: file.reciver
                };
            });

            console.log('Сообщения с файлами:', fileMessages);

            // Объединяем сообщения и файлы
            const combinedMessages = [...messages, ...fileMessages];

            // Сортируем по createtime
            combinedMessages.sort((a, b) => new Date(a.createtime || a.createtime) - new Date(b.createtime || b.createtime));

            console.log('Объединённые сообщения:', combinedMessages);

            this.chatMessages = combinedMessages;

            // Прокрутка вниз после загрузки данных
            setTimeout(() => {
                if (this.scrollToBottom) {
                    this.scrollToBottom();
                } else {
                    console.warn('scrollToBottom не определен');
                }
            }, 50);
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных чата:', error);
        });
},
    fetchChatMessages(pk_agent) {
        axios.get('http://185.155.18.145:15777/api/tamsmobile/messages/recivedisp', {
            params: {
                pk_agent: pk_agent,
                date: this.filterDate, // Используйте текущую выбранную дату
            },
        })
        .then(response => {
            this.chatMessages = response.data;
        })
        .catch(error => {
            console.error('Ошибка при загрузке сообщений:', error);
        });
    },
    fetchChatFiles(pk_agent) {
        axios.get('http://185.155.18.145:15777/api/tamsmobile/chat/files', {
            params: {
                pk_agent: pk_agent,
                date: this.filterDate, // Используйте текущую выбранную дату
            },
        })
        .then(response => {
            this.chatFiles = response.data;
        })
        .catch(error => {
            console.error('Ошибка при загрузке файлов:', error);
        });
    },
    sendMessage() {
    if (!this.newMessage.trim() && this.selectedReaction === 0) return;

    const localTime = new Date();


    const messageData = {
        type: this.selectedReaction,
        from_device_gid: '00000000-0000-0000-0000-000000000000',
        sender_name: 'Диспетчер',
        lon_x: "-1",
        lat_y: "-1",
        txt: this.newMessage,
        pk_agent: this.selectedAgentForChat.pk,
        createtime: this.formatDateTime(localTime),
        clientId: this.clientId // Добавьте идентификатор клиента
    };

    axios.post('http://185.155.18.145:15777/api/tamsmobile/messages/senddisp', messageData)
        .then(response => {
            this.chatMessages.push(response.data); // Локальное добавление
            this.newMessage = '';
            this.selectedReaction = 0;
        })
        .catch(error => {
            console.error('Ошибка при отправке сообщения:', error);
        });

         // Прокручиваем чат вниз для отображения новых сообщений
    setTimeout(() => {
        this.scrollToBottom();
    }, 50);
},
   
    openFilePicker() {
        this.$refs.fileInput.click();
    },
    uploadFiles(event) {
    const localTime = new Date();
    const files = event.target.files;
    if (!files.length) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        formData.append('files', file);

        // Генерация URL для предпросмотра файла
        const fileUrl = URL.createObjectURL(file);

        // Добавляем файл в список сообщений с превью
        this.chatMessages.push({
            id: Date.now(), // уникальный идентификатор
            sender: { id: 'user', name: 'Вы' },
            file_name: file.name,
            url: fileUrl,
            createtime: this.formatDateTime(localTime),
            isFile: true,
            fileType: file.type.split('/')[0], // тип файла (image, pdf, etc.)
            fileSize: file.size,
            reaction: null,
        });
    }

    formData.append('pk_agent', this.selectedAgentForChat.pk);
    formData.append('for_chat', true);

    // Получаем текущее локальное время в нужном формате
    const formattedTime = this.formatDateTime(localTime);
    formData.append('createtime', formattedTime);

    axios.post('http://185.155.18.145:15777/api/tamsmobile/chat/uploaddisp', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    .then(response => {
        // Обновляем список сообщений и файлов
      //  this.fetchChatData(this.selectedAgentForChat.pk);
    })
    .catch(error => {
        console.error('Ошибка при загрузке файлов:', error);
    });

    // Очищаем input после загрузки файлов
    event.target.value = '';

    // Прокручиваем чат вниз для отображения новых сообщений
    setTimeout(() => {
        this.scrollToBottom();
    }, 50);
    
},
isMyMessage(message) {
  // Если сообщение отправлено диспетчером
  if (message.reciver === '0') {
    return true;
  }
  return message.reciver === 0;
},
    getReactionIcon(type) {
        switch(type) {
            case 1: return 'mdi-emoticon-happy';
            case 2: return 'mdi-alert';
            case 3: return 'mdi-flash';
            default: return 'mdi-message-text';
        }
    },
    getReactionColor(type) {
        switch(type) {
            case 1: return 'green';
            case 2: return 'yellow';
            case 3: return 'red';
            default: return 'blue';
        }
    },
    // Обработчик для открытия задания по pk_task_link
    openTask(pk_task_link) {
        // Реализуйте логику открытия задания
    },
// Метод для обработки сообщений из сокета
handleMessageSent(newMessage) {
  console.log('newMessage:', newMessage);

  // Проверяем тип сообщения: чат или оповещение
  if (newMessage.type && newMessage.type !== 0) {
    // Это оповещение
    this.alerts.push(newMessage); // Добавляем в таблицу оповещений
    console.log('Новое оповещение добавлено:', newMessage);
  } else {
    // Это сообщение для чата
    this.chatMessages.push(newMessage); // Добавляем в чат
    this.notifyAgentMessage(newMessage.pk_agent); // Уведомление о новом сообщении
  }

  // Формируем сообщение для snackbar
  const snackbarMessage = `${newMessage.sender_name}: ${newMessage.txt}`;

  // Определяем цвет в зависимости от типа сообщения
  let color;
  switch (newMessage.type) {
    case 1:
      color = "green";
      break;
    case 2:
      color = "yellow";
      break;
    case 3:
      color = "red";
      break;
    default:
      color = "primary";
  }

  // Показываем snackbar с соответствующими данными
  this.showSnackbar(snackbarMessage, color, newMessage.pk_agent);
},

    // Метод для обработки полученных через сокет файлов
    handleFileUploaded(newFile) {
    console.log('newFile:', newFile); // Проверьте, что поле createtime присутствует

 
    // Преобразуем файл в формат сообщения
    const fileMessage = {
      ...newFile,
      isFile: true,
      createtime: newFile.createtime,
    };

    // Добавляем файл в список сообщений
    this.chatMessages.push(fileMessage);

    // Сортируем сообщения
    this.chatMessages.sort((a, b) => new Date(a.createtime) - new Date(b.createtime));

    // Обновляем список файлов в отдельной вкладке, если нужно
    this.chatFiles.push(newFile);

    // Уведомляем о новом сообщении
    this.notifyAgentMessage(newFile.pk_agent);
  },
    // Метод для мигания иконки агента
    notifyAgentMessage(pk_agent) {
    console.log('notifyAgentMessage вызван с pk_agent:', pk_agent);

    // Приводим pk_agent и значения в this.agents к строковому типу для сравнения
    const agent = this.agents.find(a => String(a.pk) === String(pk_agent));

    if (agent) {
        console.log('Найден агент для мигания:', agent);
        agent.hasNewMessage = true;
        // Логика для мигания иконки
        setTimeout(() => {
            agent.hasNewMessage = false;
        }, 100000); // Мигает в течение 5 секунд
    } else {
        console.warn('Агент с pk_agent:', pk_agent, 'не найден');
    }
},

  // Проверяем, является ли файл изображением
  isImageFile(fileName) {
    return /\.(jpg|jpeg|png|gif)$/i.test(fileName);
  },


 handleTaskUpdated(updatedTask) {
    console.log('Получено событие taskUpdated:', updatedTask);

    // Переименовываем поле description в problem_description
    const transformedTask = {
      ...updatedTask,
      plan_time_begin: this.formatDateTime(updatedTask.plan_time_begin),
      fact_time_moveto: this.formatDateTime(updatedTask.fact_time_moveto),
      fact_time_start: this.formatDateTime(updatedTask.fact_time_start),
      fact_time_close: this.formatDateTime(updatedTask.fact_time_close),
      lastedittime: this.formatDateTime(updatedTask.lastedittime),
      createtime: this.formatDateTime(updatedTask.createtime),
      fact_time_arrive: this.formatDateTime(updatedTask.fact_time_arrive),
      plan_time_end: this.formatDateTime(updatedTask.plan_time_end),
      plan_time_arrival: this.formatDateTime(updatedTask.plan_time_arrival),
    };


    // Находим заказ в вашем массиве `filteredOrders` по `pk`
    const orderIndex = this.filteredOrders.findIndex(order => order.pk === updatedTask.pk);

    if (orderIndex !== -1) {
      // Обновляем данные заказа напрямую
      this.filteredOrders[orderIndex] = {
        ...this.filteredOrders[orderIndex],
        ...transformedTask
      };

      // Если вы используете массив `orders`, обновите его аналогично
      const fullOrderIndex = this.orders.findIndex(order => order.pk === updatedTask.pk);
      if (fullOrderIndex !== -1) {
        this.orders[fullOrderIndex] = {
          ...this.orders[fullOrderIndex],
          ...transformedTask
        };
      }

      // Обновляем маркеры на карте, если необходимо
      this.updateSingleMarker(this.filteredOrders[orderIndex]);
    } else {
      // Если заказ не найден, вы можете добавить его или проигнорировать
      console.warn('Заказ с pk:', updatedTask.pk, 'не найден в списке заказов.');
    }

    // Vue автоматически пересчитает вычисляемые свойства
  },


  formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
},

getFileIcon(fileType) {
    const icons = {
        'image': 'mdi-image',
        'pdf': 'mdi-file-pdf',
        'video': 'mdi-video',
        'audio': 'mdi-audio',
    };
    return icons[fileType] || 'mdi-file-outline';
},

scrollToBottom() {
    // Предполагается, что у вас есть элемент-контейнер для сообщений, на который вы можете ссылаться через `ref`
    const messagesContainer = this.$refs.messagesContainer;
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
},

selectReaction(type) {
    this.selectedReactionType = type;
    console.log('Selected reaction type:', type);
  },

    
  async fetchAgentLocation(agentId) {
      const startDate = `${this.filterDate} 00:00:00`;
      const endDate = `${this.filterDate} 23:59:59`;
      
      try {
        const response = await axios.get(`http://185.155.18.145:15777/api/gps-track/${agentId}`, {
          params: { startDate, endDate }
        });
        
        if (response.data && response.data.length > 0) {
          // Get the latest location
          const latestLocation = response.data[response.data.length - 1];
          this.updateAgentMarker(agentId, latestLocation);
        }
      } catch (error) {
        console.error('Error fetching agent location:', error);
      }
    },

    updateAgentMarker(agentId, location) {
      console.log('Updating marker for agent:', agentId, 'with location:', location);
      // Remove existing marker if any
      if (this.agentLocations[agentId]?.marker) {
        this.agentLocations[agentId].marker.destroy();
      }

      // Create new marker
      const marker = new mapgl.Marker(this.map, {
        coordinates: [location.lon_x, location.lat_y],
        icon: markeragentUrl,
        size: [30, 30],
        zIndex: 15, // Higher than route markers
      });

      this.agentLocations[agentId] = {
        marker,
        location,
        lastUpdate: new Date()
      };
    },

    getOnlineStatusColor(lastPacketTime) {
  if (!lastPacketTime || lastPacketTime === '1900-01-01 00:00:00') return 'grey';

  const lastPacketMoment = moment(lastPacketTime);
  if (!lastPacketMoment.isValid()) return 'grey';

  const diff = moment().diff(lastPacketMoment, 'minutes');
  if (diff <= 30) return 'green';
  if (diff <= 60) return 'orange';
  if (diff <= 120) return 'red';
  // Для diff > 120 возвращаем красный цвет
  return 'red';
},

getOnlineStatusIcon(lastPacketTime) {
  if (!lastPacketTime || lastPacketTime === '1900-01-01 00:00:00') {
    return 'mdi-help-circle';
  }
  const lastPacketMoment = moment(lastPacketTime);
  if (!lastPacketMoment.isValid()) return 'mdi-help-circle';

  const diff = moment().diff(lastPacketMoment, 'minutes');
  if (diff <= 30) return 'mdi-check-circle';
  if (diff <= 60) return 'mdi-clock';
  if (diff <= 120) return 'mdi-alert';
  // Для diff > 120 возвращаем mdi-alert
  return 'mdi-alert';
},

    getOnlineStatusText(lastPacketTime) {
  if (!lastPacketTime || lastPacketTime === '1900-01-01 00:00:00') {
    return 'Не зарегистрирован';
  }
  const lastPacketMoment = moment(lastPacketTime);
  if (!lastPacketMoment.isValid()) {
    return 'Неизвестно';
  }
  const diff = moment().diff(lastPacketMoment, 'minutes');
  if (diff <= 30) return 'Онлайн';
  if (diff <= 60) return 'Отошёл';
  if (diff <= 120) return 'Оффлайн';
  // Для diff > 120
  return 'Давно оффлайн';
},

    async fetchDriverShiftStatus(agentPk) {
      try {
        const response = await axios.get('http://185.155.18.145:15777/api/driver_route_activity', {
          params: { agent_pk: agentPk }
        });
        if (response.data && response.data.length > 0) {
          const activity = response.data[0];
          this.shiftStatus[agentPk] = activity;
        }
      } catch (error) {
        console.error('Error fetching shift status:', error);
      }
    },

    isAgentOnDuty(agentPk) {
      const status = this.shiftStatus[agentPk];
      return status && status.start_time && !status.end_time;
    },

    getDutyStatusColor(agentPk) {
      const status = this.shiftStatus[agentPk];
      if (!status) return 'grey';
      if (status.start_time && !status.end_time) return 'green';
      if (status.start_time && status.end_time) return 'red';
      return 'grey';
    },

    getDutyStatusIcon(agentPk) {
      const status = this.shiftStatus[agentPk];
      if (!status) return 'mdi-account-question';
      if (status.start_time && !status.end_time) return 'mdi-account-check';
      if (status.start_time && status.end_time) return 'mdi-account-off';
      return 'mdi-account-question';
    },

    getDutyStatusText(agentPk) {
      const status = this.shiftStatus[agentPk];
      if (!status) return 'Статус неизвестен';
      if (status.start_time && !status.end_time) return 'На смене';
      if (status.start_time && status.end_time) return 'Смена завершена';
      return 'Не на смене';
    },

    startLocationUpdates() {
      this.locationUpdateInterval = setInterval(() => {
  this.agentsWithRouteInfo.forEach(agent => {
    this.fetchAgentLocation(agent.pk);
        });
      }, 300000); // Update every 5 minutes
    },

    stopLocationUpdates() {
      if (this.locationUpdateInterval) {
        clearInterval(this.locationUpdateInterval);
      }
    },

    drawAgentTrack(agentId, trackPoints) {
  // Удаляем предыдущий трек, если он есть
  if (this.agentTracks[agentId]) {
    this.agentTracks[agentId].destroy();
    delete this.agentTracks[agentId];
  } else {
    // Если трека нет, создаем
    const coordinates = trackPoints.map(point => [point.lon_x, point.lat_y]);

    // Создаём полилинию
    const polyline = new mapgl.Polyline(this.map, {
      coordinates,
      width: 3,
      color: '#2196F3',
      zIndex: 10,
    });

    // Сохраняем полилинию для возможного удаления в будущем
    this.agentTracks[agentId] = polyline;

    // Зумируем карту на трек
    this.zoomToCoordinates(coordinates);
  }
},
    async showAgentTrack(agent) {
  try {
    const startDate = `${this.filterDate} 00:00:00`;
    const endDate = `${this.filterDate} 23:59:59`;

    const response = await axios.get(`http://185.155.18.145:15777/api/gps-track/${agent.pk}`, {
      params: { startDate, endDate }
    });

    if (response.data && response.data.length > 0) {
      this.drawAgentTrack(agent.pk, response.data);
    } else {
      console.warn('Нет данных GPS для агента:', agent.name);
      this.showSnackbar(`Нет данных GPS для агента: ${agent.name}`, 'warning');
    }
  } catch (error) {
    console.error('Ошибка при загрузке GPS трека агента:', error);
    this.showSnackbar('Ошибка при загрузке GPS трека агента', 'error');
  }
},

  rawAgentTrack(agentId, trackPoints) {
  // Удаляем предыдущий трек, если он есть
  if (this.agentTracks[agentId]) {
    this.agentTracks[agentId].destroy();
    delete this.agentTracks[agentId];
  } else {
    // Если трека нет, создаем
    const coordinates = trackPoints.map(point => [point.lon_x, point.lat_y]);

    // Создаём полилинию
    const polyline = new mapgl.Polyline(this.map, {
      coordinates,
      width: 3,
      color: '#2196F3',
      zIndex: 10,
    });

    // Сохраняем полилинию для возможного удаления в будущем
    this.agentTracks[agentId] = polyline;

    // Зумируем карту на трек
    this.zoomToCoordinates(coordinates);
  }
},

  getBoundsFromCoordinates(coordinates) {
    const lats = coordinates.map(coord => coord[1]);
    const lons = coordinates.map(coord => coord[0]);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    return [ [minLon, minLat], [maxLon, maxLat] ];
  },

  openAgentDrawer(agent) {
    this.selectedAgent = agent;
    this.agentDrawer = true;
    this.loadAgentTrack(agent.pk);
  },


  async loadAgentTrack(agentId) {
    try {
      this.loadingAgentTrack = true;

      const startDate = `${this.filterDate} 00:00:00`;
      const endDate = `${this.filterDate} 23:59:59`;

      const response = await axios.get(`http://185.155.18.145:15777/api/gps-track/${agentId}`, {
        params: { startDate, endDate }
      });

      if (response.data && response.data.length > 0) {
        this.agentTrackPoints = response.data;
        this.displayAgentTrackOnMap();
      } else {
        console.warn('Нет данных GPS для агента:', agentId);
        this.showSnackbar('Нет данных GPS для агента', 'warning');
      }
    } catch (error) {
    console.error('Ошибка при загрузке GPS трека агента:', error);
    this.showSnackbar('Ошибка при загрузке GPS трека агента', 'error');
  } finally {
    this.loadingAgentTrack = false;
  }
},

  displayAgentTrackOnMap() {
    // Удаляем предыдущую полилинию трека, если она есть
    if (this.agentTrackPolyline) {
      this.agentTrackPolyline.destroy();
    }

    // Создаём массив координат
    const coordinates = this.agentTrackPoints.map(point => [point.lon_x, point.lat_y]);

    // Создаём полилинию
    this.agentTrackPolyline = new mapgl.Polyline(this.map, {
      coordinates,
      width: 3,
      color: '#FF5722',
      zIndex: 12,
    });

    // Масштабируем карту на трек
    this.calculateTrackStatistics(this.agentTrackPoints);
  },

  calculateTrackStatistics(trackPoints) {
    let totalDistance = 0;
    let totalDuration = 0;
    let speeds = [];

    for (let i = 1; i < trackPoints.length; i++) {
      const prevPoint = trackPoints[i - 1];
      const currPoint = trackPoints[i];

      // Вычисление расстояния между точками
      const distance = this.calculateDistance(
        prevPoint.lat_y, prevPoint.lon_x,
        currPoint.lat_y, currPoint.lon_x
      );
      totalDistance += distance;

      // Вычисление разницы во времени
      const timeDiff = (new Date(currPoint.point_time) - new Date(prevPoint.point_time)) / 1000; // в секундах
      totalDuration += timeDiff;

      // Сбор скоростей
      if (currPoint.speed) {
        speeds.push(currPoint.speed);
      }
    }

    this.totalDistance = (totalDistance / 1000).toFixed(2); // в км
    this.totalDuration = this.formatDuration(totalDuration);
    this.avgSpeed = speeds.length ? (speeds.reduce((a, b) => a + b) / speeds.length).toFixed(1) : 0;
  },

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Радиус Земли в метрах
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // в метрах
  },

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} ч ${minutes.toString().padStart(2, '0')} мин`;
  },

  closeAgentDrawer() {
  this.agentDrawer = false;
  this.selectedAgent = null;
  this.agentTrackPoints = [];
  this.totalDistance = 0;
  this.totalDuration = '0 ч 00 мин';
  this.avgSpeed = 0;

  // Удаляем трек с карты
  if (this.agentTrackPolyline) {
    this.agentTrackPolyline.destroy();
    this.agentTrackPolyline = null;
  }

  // Удаляем маркер
  if (this.highlightMarker) {
    this.highlightMarker.destroy();
    this.highlightMarker = null;
  }
},

highlightPointOnMap(point) {
    // Удаляем предыдущий маркер, если есть
    if (this.highlightMarker) {
      this.highlightMarker.destroy();
    }
    // Создаем новый маркер
    this.highlightMarker = new mapgl.Marker(this.map, {
      coordinates: [point.lon_x, point.lat_y],
      icon: markergpsUrl, // Используем вашу иконку
      size: [30, 30],
      zIndex: 20,
    });
    // Центрируем карту на точку
    this.map.setCenter([point.lon_x, point.lat_y]);
    this.map.setZoom(16);
  },

  async toggleAgentTrack(agent) {
    if (this.agentTracks[agent.pk]) {
      // Трек отображен, скрываем его
      this.agentTracks[agent.pk].destroy();
      delete this.agentTracks[agent.pk];
    } else {
      // Трек не отображен, загружаем и отображаем
      await this.showAgentTrack(agent);
    }
  },

  async loadAlerts() {
  try {
    const startDate = `${this.filterDate}`;
    const response = await axios.get('http://185.155.18.145:15777/api/tamsmobile/messagesbyType', {
      params: { date: startDate },
    });
    this.alerts = response.data;
    if (this.showOnMap) {
      this.displayAlertsOnMap();
    }
  } catch (error) {
    console.error('Error loading alerts:', error);
  }
},

handleRowClick(event, { item }) {
  if (event.target.closest('.v-btn')) return;

  console.log("Строка таблицы выбрана:", item);
  this.focusOnAlert(item);
},
focusOnAlert(alert) {
  if (!alert || !this.alertMarkers[alert.pk]) {
    console.warn("Маркер для выбранного алерта не найден:", alert);
    return;
  }

  const { coordinates } = this.alertMarkers[alert.pk];
  console.log("Координаты маркера:", coordinates);

  if (!coordinates || coordinates.length !== 2) {
    console.error("Координаты маркера некорректны:", coordinates);
    return;
  }

  this.map.setCenter(coordinates);
  this.map.setZoom(16);
},
  toggleFilter(type) {
  const index = this.selectedTypes.indexOf(type); // Используйте this.selectedTypes
  if (index === -1) {
    this.selectedTypes.push(type);
  } else {
    this.selectedTypes.splice(index, 1);
  }
},



  getAlertTypeColor(type) {
    const alertType = this.alertTypes.find(t => t.value === type);
    return alertType ? alertType.color : 'grey';
  },

  getAlertTypeName(type) {
    const alertType = this.alertTypes.find(t => t.value === type);
    return alertType ? alertType.title : 'Неизвестно';
  },

  displayAlertsOnMap() {
  Object.values(this.alertMarkers).forEach(markerObj => markerObj.marker.destroy());
  this.alertMarkers = {};

  const filteredAlerts = this.selectedTypes.length > 0 
    ? this.alerts.filter(alert => this.selectedTypes.includes(alert.type))
    : this.alerts;

  filteredAlerts.forEach(alert => {
    if (alert.lon_x == null || alert.lat_y == null) {
      console.warn("Некорректные координаты для алерта:", alert);
      return;
    }

    const coordinates = [alert.lon_x, alert.lat_y];
    const marker = new mapgl.Marker(this.map, {
      coordinates,
      icon: this.getAlertIcon(alert.type),
      size: [30, 30],
      zIndex: 15,
    });

    this.alertMarkers[alert.pk] = { marker, coordinates }; // Сохраняем объект маркера с координатами
  });
},

getAlertIcon(type) {
  // Импортированные иконки, привязанные к типу
  const icons = {
    1: markeralert1Url,
    2: markeralert2Url,
    3: markeralert3Url
  };

  // Возвращаем иконку только если тип существует
  return icons[type] || null;
},

  },


    
    mounted() {
        this.initMap();
        this.applyDateFilter();
        this.fetchAgents().then(() => {
  this.agentsWithRouteInfo.forEach(agent => {
    this.fetchDriverShiftStatus(agent.pk);
    this.fetchAgentLocation(agent.pk);
  });
}); // Загружаем агентов при загрузке компонента
      document.addEventListener('keydown', this.onGlobalKeyDown);
      document.addEventListener('keyup', this.onGlobalKeyUp);
        window.addEventListener('resize', this.onWindowResize); // Добавлено
         // Инициализация массива полилиний
        this.polylines = [];
        this.selectAllColumns();
        this.fetchZones();
        this.fetchSkills(); 
        this.fetchWorkTypes();
        this.fetchStatusDescriptions();
        this.loadAlerts();

    
this.startLocationUpdates();

this.statusUpdateInterval = setInterval(() => {
    this.fetchAgentStatuses();
  }, 5 * 60 * 1000); // 5 минут в миллисекундах

 
        socket.on('messageSent', (newMessage) => {
    if (newMessage.clientId !== this.clientId) { // Проверка, чтобы не обрабатывать свои же сообщения
        this.handleMessageSent(newMessage);
    }
});

socket.on('messageReceived', this.handleMessageSent);
socket.on('fileUploaded', this.handleFileUploaded);
socket.on('fileUploadeddisp', this.handleFileUploaded);


 
        socket.on('orderCreated', this.handleOrderCreated);
        socket.on('taskUpdated', this.handleTaskUpdated);
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
      window.removeEventListener('resize', this.onWindowResize); 
      this.stopLocationUpdates();// Добавлено
      clearInterval(this.statusUpdateInterval);

        socket.off('orderCreated', this.handleOrderCreated);
        socket.off('messageSent', (newMessage) => {
    if (newMessage.clientId !== this.clientId) { // Проверка, чтобы не обрабатывать свои же сообщения
        this.handleMessageSent(newMessage);
    }
});
        socket.off('messageReceived', this.handleMessageSent);
        socket.off('fileUploaded', this.handleFileUploaded);
        socket.off('fileUploadeddisp', this.handleFileUploaded);
 
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

    socket.off('taskUpdated', this.handleTaskUpdated);
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
    
    .map-container-track {
      position: sticky; /* Карта остаётся на месте при прокрутке */
      top: 0;
      width: 100%;
      height: 47vh;
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
    
    .blinking {
  animation: blinker 1.5s linear infinite;
}

.messages-container {
  height: 400px;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message-right {
  justify-content: flex-end;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-bubble {
  padding: 8px 12px;
  border-radius: 12px;
  position: relative;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
}

.my-bubble {
  background-color: #e3f2fd;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.other-bubble {
  background-color: white;
  margin-right: auto;
  border-bottom-left-radius: 4px;
}

.reaction-border-green {
  border-color: #4CAF50;
}

.reaction-border-yellow {
  border-color: #FFC107;
}

.reaction-border-red {
  border-color: #F44336;
}

.message-text {
  word-break: break-word;
  margin-right: 8px;
}

.message-meta {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 4px;
  text-align: right;
}

.file-attachment {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.file-preview {
  border-radius: 8px;
  overflow: hidden;
}

.file-info {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
}

.file-details {
  margin-left: 8px;
}

.file-name {
  color: inherit;
  text-decoration: none;
  font-weight: 500;
}

.file-size {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

.chat-input {
  padding: 16px;
  background-color: white;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.message-input {
  flex-grow: 1;
}

.reaction-icon {
  position: absolute;
  top: -12px;
  right: -12px;
  background: white;
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.glow-effect {
  animation: glow 2s ease-in-out infinite;
}

.status-indicators {
  display: flex;
  align-items: center;
  gap: 4px;
}

.alerts-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.status-filter :deep(.v-field__input),
.status-filter :deep(.v-select__selection) {
  color: white !important;
}

.search-field :deep(.v-field__input) {
  color: white !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


@keyframes blinker {
  50% {
    opacity: 0;
  }
}

@keyframes glow {
  0% {
    box-shadow: 0 0 5px rgba(0,255,0,0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(0,255,0,0.8);
  }
  100% {
    box-shadow: 0 0 5px rgba(0,255,0,0.5);
  }
}

    </style>
    