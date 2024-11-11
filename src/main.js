import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from './router';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Импортируем русскую локаль


// Устанавливаем глобальную локаль Day.js
dayjs.locale('ru');

createApp(App)
  .use(vuetify)
  .use(createPinia())
  .use(router)
  .mount('#app');