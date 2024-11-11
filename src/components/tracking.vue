<template>
    <v-app>
      <v-main>
        <v-container fluid class="fill-height">
          <v-row no-gutters style="height: 100%;">
            <!-- Drivers Table -->
            <v-col cols="12" md="3" class="pr-md-2">
              <v-card class="fill-height">
                <v-card-title>Drivers</v-card-title>
                <v-data-table
                  :headers="driverHeaders"
                  :items="drivers"
                  :items-per-page="8"
                  class="elevation-1"
                  @click:row="selectDriver"
                >
                  <template v-slot:item.status="{ item }">
                    <v-chip
                      :color="item.status === 'Active' ? 'green' : 'gray'"
                      small
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>
                </v-data-table>
              </v-card>
            </v-col>
  
            <!-- Main Content Area -->
            <v-col cols="12" md="9" class="pl-md-2">
              <v-card class="fill-height">
                <v-tabs v-model="activeTab">
                  <v-tab value="map">Map</v-tab>
                  <v-tab value="route">Route Details</v-tab>
                  <v-tab value="alerts">Alerts</v-tab>
                  <v-tab value="chat">Chat</v-tab>
                  <v-tab value="gps">GPS</v-tab>
                </v-tabs>
  
                <v-window v-model="activeTab" class="fill-height">
                  <!-- Map Tab -->
                  <v-window-item value="map">
                    <v-row no-gutters style="height: 100%;">
                      <v-col cols="12" md="8" class="pr-md-2">
                        <div id="map" style="height: 400px;"></div>
                      </v-col>
                      <v-col cols="12" md="4" class="pl-md-2">
                        <v-card-title>Orders</v-card-title>
                        <v-list>
                          <v-list-item v-for="order in orders" :key="order.id">
                            <v-list-item-content>
                              <v-list-item-title>Order #{{ order.id }}</v-list-item-title>
                              <v-list-item-subtitle>Status: {{ order.status }}</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                              <v-icon :color="getOrderColor(order.status)">
                                mdi-package-variant
                              </v-icon>
                            </v-list-item-action>
                          </v-list-item>
                        </v-list>
                      </v-col>
                    </v-row>
                  </v-window-item>
  
                  <!-- Route Details Tab -->
                  <v-window-item value="route">
                    <v-card-text>
                      <h3 v-if="selectedDriver">Route Details for {{ selectedDriver.name }}</h3>
                      <p v-else>Select a driver to view route details.</p>
                      <!-- Add more detailed route information here -->
                    </v-card-text>
                  </v-window-item>
  
                  <!-- Alerts Tab -->
                  <v-window-item value="alerts">
                    <v-list>
                      <v-list-item v-for="alert in alerts" :key="alert.id">
                        <v-list-item-content>
                          <v-list-item-title>{{ alert.driver }}</v-list-item-title>
                          <v-list-item-subtitle>{{ alert.message }}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-icon color="red">mdi-alert</v-icon>
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                  </v-window-item>
  
                  <!-- Chat Tab -->
                  <v-window-item value="chat">
                    <v-card-text style="height: 300px; overflow-y: auto;">
                      <!-- Chat messages would go here -->
                      <p class="text-center">No messages yet</p>
                    </v-card-text>
                    <v-card-actions>
                      <v-text-field
                        v-model="chatMessage"
                        label="Type your message"
                        append-outer-icon="mdi-send"
                        @click:append-outer="sendMessage"
                        @keyup.enter="sendMessage"
                      ></v-text-field>
                    </v-card-actions>
                  </v-window-item>
  
                  <!-- GPS Tab -->
                  <v-window-item value="gps">
                    <div id="gps-map" style="height: 400px;"></div>
                    <!-- Add controls for selecting driver and time range -->
                  </v-window-item>
                </v-window>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
    
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'


  
  // Mock data
  const drivers = ref([
    { id: 1, name: 'John Doe', status: 'Active', job: 'Delivery', timeslot: '9:00 AM - 5:00 PM' },
    { id: 2, name: 'Jane Smith', status: 'Inactive', job: 'Pickup', timeslot: '10:00 AM - 6:00 PM' },
    // Add more drivers as needed
  ])
  
  const orders = ref([
    { id: 1, lat: 40.7128, lng: -74.0060, status: 'In Progress' },
    { id: 2, lat: 40.7282, lng: -73.7949, status: 'Completed' },
    // Add more orders as needed
  ])
  
  const alerts = ref([
    { id: 1, driver: 'John Doe', message: 'Traffic delay on Main St.' },
    { id: 2, driver: 'Jane Smith', message: 'Vehicle breakdown' },
    // Add more alerts as needed
  ])
  
  const driverHeaders = [
    { title: 'Name', key: 'name' },
    { title: 'Status', key: 'status' },
    { title: 'Job', key: 'job' },
  ]
  
  const activeTab = ref('map')
  const selectedDriver = ref(null)
  const chatMessage = ref('')
  let map = null
  
  const selectDriver = (driver) => {
    selectedDriver.value = driver
  }
  
  const getOrderColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'yellow'
      case 'Completed':
        return 'green'
      default:
        return 'gray'
    }
  }
  
  const sendMessage = () => {
    if (chatMessage.value.trim()) {
      // Implement chat functionality here
      console.log('Sending message:', chatMessage.value)
      chatMessage.value = ''
    }
  }
  
 
  
 
  
  
  </script>
  
  <style>
 
  
  .marker {
    cursor: pointer;
  }
  </style>