<template>
  <f7-page name="settings">
    <f7-navbar title="Настройки"></f7-navbar>
      <f7-list class="no-margin"> 
        <f7-list-item title="Баланс">
          <div slot="after" @click="refillBalance">{{balance}} ₽&nbsp;<f7-icon class="theme-color-red" f7="plus_circle_fill"></f7-icon></div>
        </f7-list-item>
        <f7-list-item title="5-ти минутный вход без кода">
          <f7-toggle :checked="fivemins" @change="newSetting('pin', $event.target.checked)"></f7-toggle>
        </f7-list-item>
        <f7-list-item v-if="biometric" title="Вход по отпечатку пальца">
          <f7-toggle :checked="biologin" @change="newSetting('bio', $event.target.checked)"></f7-toggle>
        </f7-list-item>
        <f7-list-item link="/devices/" title="Мои устройства"></f7-list-item>
        <f7-row class="margin">
          <f7-col width="10"></f7-col>
          <f7-button width="80" style="width: 80%" outline large-ios @click="dropAllTables">СБРОС ДАННЫХ</f7-button>
          <f7-col width="10"></f7-col>
        </f7-row>
      </f7-list>
    <f7-block>
      <f7-row>
        <f7-col class="pannn">
          <p><img class="image dynamic-popover" alt="1" src="static/ico.jpg" width="18%"/></p>
          <p>Сэйв.info</p>
          <p>Версия: 5.0</p>
        </f7-col>
      </f7-row>
    </f7-block>
  </f7-page>
</template>

<script>
  import { f7, f7ready } from 'framework7-vue';
  import moment from 'moment';
  import store from '../store/store.js';

export default {
  name: "settingsview",
  components: {

  },
  data(){
    const iab = this.$root.iab;
    const db = this.$root.db;
    const biometric = this.$root.fp;
    const biologin = this.$store.getters.getUserBioLogin;
    const fivemins = this.$store.getters.getUserFiveMins;
    return{
      db,
      iab,
      biometric,
      fivemins,
      biologin
    }
  },
  computed: {
    balance: function(){
      return this.$store.getters.getUserBalance;
    }
  },
  watch: {
    balance: function(newBalance, oldBalance){
      return this.$store.getters.getUserBalance;
    }
  },
  methods:{
    newSetting(prop, nbool){
      const self = this;
      const app = self.$f7;
      self.db.transaction(function(tx){
        tx.executeSql('UPDATE setTable SET value = ? WHERE setting = ?', [nbool, prop]);
        switch(prop){
          case "pin":
            self.$store.commit('setUserFiveMins', nbool);
          break;
          case "bio":
            self.$store.commit('setUserBioLogin', nbool);
          break;
        }
      }, function(error){
        console.log('ошибка сохранения - ' + error.message);
      }, function(){
        console.log('настройки сохранены', prop, nbool);
      });
    },
    dropAllTables(){
      const self = this;
      const app = self.$f7;

      app.dialog.confirm('Вы уверены, что хотите сбросить все данные приложения?', function(){
        self.db.transaction(function(tx){
          tx.executeSql('DROP TABLE setTable');
          tx.executeSql('DROP TABLE saveMessagesTable');
          tx.executeSql('DROP TABLE sosTable');
          tx.executeSql('DROP TABLE saveNotesTable');
          tx.executeSql('DROP TABLE objectsTable');
        }, function(error){
          app.dialog.alert('ошибка');
          console.log('clear tables error', error);
        }, function(){
          app.dialog.alert('Перезапустите приложение, чтобы изменения вступили в силу.');
        });
      });
    },
    refillBalance(){
      const self = this;
      const app = self.$f7;
      let dogovor = this.$store.getters.getUserDogovor;
      app.dialog.progress('Загрузка...');
      let options = 'hideurlbar=yes,hidenavigationbuttons=no,hidden=yes,closebuttoncaption=Готово';
      const ref = self.iab.open('https://www.ohrana-save.ru/arius', '_blank', options);
      ref.addEventListener('loadstop', function() {
        ref.insertCSS({code: " .footer, .header-top, .header-bottom__nav { display: none!important } "});
        ref.executeScript({code: "document.getElementsByName('nomer_dogovora')[0].value = '"+ dogovor +"';"})
        app.dialog.close();
        ref.show();
      });
      ref.addEventListener('exit', function() {
        ref.close();
      });
    }
  }
}
</script>

