<!-- src/components/WarehouseManager.vue -->
<template>
    <!-- Диалог управления складами -->
    <v-dialog v-model="stocksDialog" max-width="800px">
      <v-card>
        <v-card-title>
          Управление складами
          <v-spacer></v-spacer>
          

            <v-btn color="green"     density="compact"
 prepend-icon="mdi-plus"  @click="openAddStockModal">
    Добавить новый
  </v-btn>
         
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="stockHeaders"
            :items="stocks"
            class="elevation-1"
            :hide-default-header="false"
          >

            <template #item.actions="{ item }">
              <v-btn small @click="editStock(item)" color="blue" text>
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn small @click="deleteStock(item.gid)" color="red" text>
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="closeStocksDialog">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  
    <!-- Диалог формы добавления/редактирования склада -->
    <v-dialog v-model="stockFormDialog" max-width="600px">
      <v-card>
        <v-card-title>{{ stockFormTitle }}</v-card-title>
        <v-card-text>
          <v-form ref="stockForm">
            <v-text-field v-model="currentStock.name" label="Название склада" required></v-text-field>
            <v-text-field v-model="currentStock.addr" label="Адрес" required></v-text-field>
            <v-textarea v-model="currentStock.comment" label="Комментарий"></v-textarea>
            <v-text-field
              v-model="currentStock.lon_x"
              label="Долгота"
              type="number"
              required
            ></v-text-field>
            <v-text-field
              v-model="currentStock.lat_y"
              label="Широта"
              type="number"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="closeStockFormDialog">Отмена</v-btn>
          <v-btn color="primary" @click="submitForm">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </template>
  
  
  <script>
  import { computed, ref, watch } from 'vue';
  import { useWhStore } from '@/stores/whStore';

  
  export default {
    name: 'WarehouseManager',
    
    setup() {
      const whStore = useWhStore();
     
  
      // Получение состояния из store
    const stocksDialog = computed(() => whStore.stocksDialog);
    const stockFormDialog = computed(() => whStore.stockFormDialog);
    const stockFormTitle = computed(() => whStore.stockFormTitle);
    const currentStock = computed(() => whStore.currentStock);
    const stockHeaders = computed(() => whStore.stockHeaders);
    const stocks = computed(() => whStore.stocks);

    const stockForm = ref(null); // Ссылка на форму
    const snackbar = ref({
      show: false,
      message: '',
      color: '',
    });

    // Закрыть диалог управления складами
    const closeStocksDialog = () => {
      whStore.closeStocksDialog();
    };

    // Закрыть форму добавления/редактирования склада
    const closeStockFormDialog = () => {
      whStore.closeStockFormDialog();
    };

    // Отправить форму
    const submitForm = async () => {
      try {
        await whStore.submitStockForm();
        snackbar.value.show = true;
        snackbar.value.message = 'Склад успешно сохранён.';
        snackbar.value.color = 'success';
      } catch (error) {
        snackbar.value.show = true;
        snackbar.value.message = 'Произошла ошибка при сохранении склада.';
        snackbar.value.color = 'error';// Опционально
      }
    };

    // Автоматическая загрузка складов при открытии диалога
    watch(stocksDialog, (newVal) => {
      if (newVal) {
        whStore.fetchStocks();
      }
    });

    return {
      stocksDialog,
      stockFormDialog,
      stockFormTitle,
      currentStock,
      stockHeaders,
      stocks,
      closeStocksDialog,
      closeStockFormDialog,
      submitForm,
      openAddStockModal: whStore.openAddStockModal,
      editStock: whStore.editStock,
      deleteStock: whStore.deleteStock,
      stockForm,
      snackbar,
    };
  },
};
  </script>
  
  <style >
  /* Добавьте стили по необходимости */
  </style>
  