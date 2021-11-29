<template>
  <f7-app :params="f7params" >

  <!-- Views/Tabs container -->
  <f7-views tabs class="safe-areas">
    <!-- Tabbar for switching views-tabs -->
    <f7-toolbar tabbar labels bottom>
      <f7-link tab-link="#view-home" tab-link-active icon-ios="f7:house_fill" icon-md="material:home" text="Сообщения"></f7-link>
      <f7-link tab-link="#view-catalog" icon-ios="f7:square_list_fill" icon-md="material:view_list" text="Объекты"></f7-link>
      <f7-link tab-link="#view-notes" icon-ios="f7:bookmark_fill"  icon-md="material:comment-text" text="Заметки"></f7-link>
      <f7-link tab-link="#view-settings" icon-ios="f7:gear" icon-md="material:settings" text="Настройки"></f7-link>
    </f7-toolbar>

    <f7-view id="view-home" main tab tab-active url="/"></f7-view>
    <f7-view id="view-catalog" name="catalog" tab url="/catalog/"></f7-view>
    <f7-view id="view-notes" name="notes" tab url="/notes/"></f7-view>
    <f7-view id="view-settings" name="settings" tab url="/settings/"></f7-view>

  </f7-views>

  </f7-app>
</template>
<script>
  import { Device }  from 'framework7/framework7-lite.esm.bundle.js';
  import cordovaApp from '../js/cordova-app.js';
  import routes from '../js/routes.js';
  import store from '../store/store.js';

  export default {
    data() {
      return {
        // Framework7 Parameters
        f7params: {
          id: 'com.pushmobile.saveinfo', // App bundle ID
          name: 'Сэйв.info', // App name
          theme: 'auto', // Automatic theme detection
          data: function () {
            return {
              
            };
          },
          routes: routes,
          input: {
            scrollIntoViewOnFocus: Device.cordova && !Device.electron,
            scrollIntoViewCentered: Device.cordova && !Device.electron,
          },
          statusbar: {
            iosOverlaysWebView: true,
            androidOverlaysWebView: false,
          },
          touch: {
            // Enable fast clicks
            fastClicks: true,
            tapHold: false
          },
          dialog: {
            buttonOk: 'Да',
            buttonCancel: 'Отмена',
            usernamePlaceholder: 'Пин-код',
            passwordPlaceholder: 'Пин-код'

          },
        },
      }
    },
    methods: {

    },
    mounted() {
      this.$f7ready((f7) => {
        // Init cordova APIs (see cordova-app.js)
        if (Device.cordova) {
          cordovaApp.init(f7);
        }
        // Call F7 APIs here
      });
    }
  }
</script>