import 'vuetify/styles'; // Загружаем стили Vuetify
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light', // Настройка темы, если нужно
    themes: {
      light: {
        colors: {
          primary: '#1976D2', // Задаем основной цвет темы
          secondary: '#424242',
        },
      },
    },
  },
});

