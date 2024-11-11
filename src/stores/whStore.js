// src/stores/useWhStore.js

import { defineStore } from 'pinia';
import axios from 'axios';


export const useWhStore = defineStore('whStore', {
  state: () => ({
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
    
  }),
  actions: {  
    // Открыть диалог для управления складами
    openStocksDialog() {
      this.stocksDialog = true;
    },

    // Закрыть диалог для управления складами
    closeStocksDialog() {
      this.stocksDialog = false;
    },

    // Открыть форму добавления нового склада
    openAddStockModal() {
      this.stockFormTitle = 'Добавить новый склад';
      this.currentStock = { name: '', addr: '', comment: '', lon_x: '', lat_y: '' };
      this.stockFormDialog = true;
    },

    // Закрыть форму добавления/редактирования склада
    closeStockFormDialog() {
      this.stockFormDialog = false;
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
        await this.fetchStocks();
        this.stockFormDialog = false;
        this.stocksDialog = false;
      } catch (error) {
        console.error('Ошибка при сохранении склада:', error);
        // Вы можете добавить уведомление об ошибке здесь
      }
    },

    // Удалить склад
    async deleteStock(gid) {
      try {
        await axios.delete(`http://185.155.18.145:15777/api/stocks/${gid}`);
        await this.fetchStocks();
      } catch (error) {
        console.error('Ошибка при удалении склада:', error);
        // Вы можете добавить уведомление об ошибке здесь
      }
    },

    // Получить данные складов
    async fetchStocks() {
      try {
        const response = await axios.get('http://185.155.18.145:15777/api/stocks');
        this.stocks = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке складов:', error);
        // Вы можете добавить уведомление об ошибке здесь
      }
    },
  },
  getters: {
    // Добавьте геттеры, если необходимо
  },
});