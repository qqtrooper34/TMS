import { defineStore } from 'pinia';
import axios from 'axios';

export const useZoneStore = defineStore('zoneStore', {
  state: () => ({
    zones: [],
    // Добавьте другие данные, которые вам нужны
  }),
  actions: {  
    async fetchZones() {
      try {
        const response = await axios.get('http://185.155.18.145:15777/api/zones');
        this.zones = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке зон:', error);
      }
    },

    async handleKmlFileUpload(file) { // Принимаем файл, а не событие
      if (!file) return;

      try {
        const fileContent = await file.text();
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(fileContent, 'application/xml');

        const placemarks = kmlDoc.getElementsByTagName('Placemark');

        for (let i = 0; i < placemarks.length; i++) {
          const placemark = placemarks[i];

          let name = '';
          let description = '';

          const nameNode = placemark.getElementsByTagName('name')[0];
          if (nameNode && nameNode.textContent) {
            name = nameNode.textContent.trim();
          }

          const descriptionNode = placemark.getElementsByTagName('description')[0];
          if (descriptionNode && descriptionNode.textContent) {
            description = descriptionNode.textContent.trim();
          }

          // Если name пустое, а description содержит название, используем его
          if (!name && description) {
            name = description;
            description = '';
          }

          // Извлекаем координаты
          const coordinatesNodes = placemark.getElementsByTagName('coordinates');
          const coordinatesList = [];

          for (let j = 0; j < coordinatesNodes.length; j++) {
            const coordinatesText = coordinatesNodes[j].textContent.trim();
            const coords = coordinatesText.split(/\s+/).map(coordStr => {
              const [lon, lat] = coordStr.split(',').map(Number);
              return [lon, lat];
            });
            coordinatesList.push(coords);
          }

          let geometry;

          if (coordinatesList.length > 1) {
            geometry = {
              type: 'MultiPolygon',
              coordinates: [coordinatesList],
            };
          } else {
            geometry = {
              type: 'Polygon',
              coordinates: coordinatesList,
            };
          }

          const zoneData = {
            name: name || 'Без названия',
            description: description || '',
            geometry: geometry,
          };

          try {
            await axios.post('http://185.155.18.145:15777/api/zones', zoneData);
          } catch (error) {
            console.error('Ошибка при сохранении зоны:', error);
          }
        }

        await this.fetchZones();
        // Добавьте уведомление или другую логику, если необходимо
        console.log('Зоны успешно загружены и сохранены.');

      } catch (error) {
        console.error('Ошибка при обработке KML-файла:', error);
        // Добавьте уведомление об ошибке, если необходимо
      }
    },
  },
  getters: {},
});
