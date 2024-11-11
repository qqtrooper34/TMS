<template>
  <v-app>
    <v-app-bar app color="primary" dark height="24">
      <v-toolbar-title>TAMS</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text :to="{ name: 'plan' }">Планирование</v-btn>
      <v-btn text :to="{ name: 'fact' }">Управление</v-btn>
      <template v-slot:append>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
        </template>
        <v-list>
          <v-list-item @click="triggerKmlUpload">
            <v-list-item-title>Загрузить зоны из KML</v-list-item-title>
          </v-list-item>
          <v-list-item @click="openStocks">
              <v-list-item-title>Управление складами</v-list-item-title>
            </v-list-item>
          <!-- Add more menu items here if needed -->
        </v-list>
      </v-menu>
    </template>

    <input
      type="file"
      ref="kmlFileInput"
      @change="uploadZones"
      accept=".kml"
      style="display: none;"
    />
  </v-app-bar>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>

    <div style="height: 15px;"></div>
   
        <router-view />
    <!-- Компонент управления складами -->
    <WarehouseManager />

  </v-app>
</template>

<script>
import { ref } from 'vue';
import { useZoneStore } from '@/stores/zoneStore';
import { useWhStore } from '@/stores/whStore';
import WarehouseManager from '@/components/WarehouseManager.vue';


export default {
  name: 'App',

  components: {
    WarehouseManager,
  },

  setup() {
    const zoneStore = useZoneStore();
    const whStore = useWhStore(); // Инициализируем store для складов
    const kmlFileInput = ref(null);
    const snackbar = ref({
      show: false,
      message: '',
      color: '',
    });

    function triggerKmlUpload() {
      if (kmlFileInput.value) {
        kmlFileInput.value.click();
      }
    }

    async function uploadZones(event) {
      const file = event.target.files[0];
      if (file) {
        await zoneStore.handleKmlFileUpload(file);
        snackbar.value.show = true;
        snackbar.value.message = 'Зоны успешно загружены и сохранены.';
        snackbar.value.color = 'success';
      }
    }

      // Функция открытия диалога управления складами
      function openStocks() {
      whStore.openStocksDialog();
    }

    return {
      triggerKmlUpload,
      uploadZones,
      kmlFileInput,
      snackbar,
      openStocks, 
    };
  },
  methods: {
 
  },
};
</script>

<style>
/* Уменьшение шрифта для компонентов Vuetify */
.v-application {
  font-size: 12px;
}

/* Уменьшение шрифта в таблицах */
.v-data-table {
  font-size: 12px;
}

/* Уменьшение шрифта в кнопках */
.v-btn {
  font-size: 12px;
}

.v-data-table-header th,
.v-data-table td {
  padding-top: 2px;
  padding-bottom: 2px;
}

/* Уменьшение шрифта в заголовках таблиц */
.v-data-table-header th {
  font-size: 12px;
}

</style>

