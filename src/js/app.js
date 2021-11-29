// Import Vue
import Vue from 'vue';

// Import Framework7
import Framework7 from 'framework7/framework7-lite.esm.bundle.js';

// Import Framework7-Vue Plugin
import Framework7Vue from 'framework7-vue/framework7-vue.esm.bundle.js';

// Import Framework7 Styles
import 'framework7/css/framework7.bundle.css';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.scss';
import '../css/style.sass';
// Import App Component
import App from '../components/app.vue';
import moment from 'moment';
import store from '../store/store.js';
import cordovaApp from '../js/cordova-app.js';
import app from 'framework7-vue/components/app';
import { data } from 'jquery';

// Init Framework7-Vue Plugin
Framework7.use(Framework7Vue);

var fp = false; 
var apprate = false;
var db = 0;
var dataObj = {
  pushid: '',
  signed: 0,
  pinCode: '',
  logged: 0,
  phone: '',
  balance: 0
};
var uFiveMins = false;
var uBioLogin = false;
var iab = null;

document.addEventListener("deviceready", () => {

  window.plugins.OneSignal
  .startInit("be981bb2-5fe4-448d-abfb-75e3499cc06b", "90230104830")
  .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.None)
  .endInit();
  window.plugins.OneSignal.getIds(function(ids){
    dataObj.pushid = ids.userId; 
  });  

  Fingerprint.isAvailable(isAvailableSuccess, isAvailableError);
  function isAvailableSuccess(result) {
    fp = Fingerprint;
    console.log('success', fp);
  }
  function isAvailableError(error) {
    fp = false;
  }

  iab = cordova.InAppBrowser;

  AppRate.setPreferences({
    displayAppName: 'Сэйв.info',
    usesUntilPrompt: 5,
    promptAgainForEachNewVersion: false,
    reviewType: {
      ios: 'AppStoreReview',
      android: 'InAppBrowser'
    },
    storeAppURL: {
      ios: 'com.pushmobile.saveinfo',
      android: 'market://details?id=com.pushmobile.saveinfo',
    },
    customLocale: {
      title: "Оцените %@",
      message: "Это займет менее минуты, но поможет приложению со временем стать лучше!",
      cancelButtonLabel: "Нет, спасибо",
      laterButtonLabel: "Напомнить позже",
      rateButtonLabel: "Оценить сейчас",
      yesButtonLabel: "Да!",
      noButtonLabel: "Нет",
      appRatePromptTitle: "Вам нравится приложение?",
      feedbackPromptTitle: "Не могли бы вы дать нам обратную связь?"
    },
    callbacks: {
      handleNegativeFeedback: function(){
        window.open('mailto:irk@pushmobile.ru', '_system');
      },
      onRateDialogShow: function(callback){
        callback(1) // cause immediate click on 'Rate Now' button
      },
      onButtonClicked: function(buttonIndex){
        console.log("onButtonClicked -> " + buttonIndex);
      }
    }
  });
  cordova.plugins.backgroundMode.enable();
  cordova.plugins.backgroundMode.overrideBackButton();
  cordova.plugins.backgroundMode.excludeFromTaskList();
  cordova.plugins.backgroundMode.setDefaults({ silent: true });
  cordova.plugins.autoStart.enable();
  apprate = AppRate;

  prepare();
});

const isCordovaApp = (typeof window.cordova !== "undefined");
if (!isCordovaApp){
  document.dispatchEvent(new CustomEvent("deviceready", {}));
}

function prepare() {
  if(window.sqlitePlugin){
    db = window.sqlitePlugin.openDatabase({name: 'savedb2.db', location: 'default'});
    settingsCheck();
  }else{
    console.log('бд нет');
    dataObj.pushid = 'be981bb2-5fe4-448d-abfb-75e3499cc123123';
    dataObj.pinCode = "1234";
    dataObj.signed = 1;
    dataObj.logged = 0;
    uFiveMins = false;
    uBioLogin = false;
    fp = true;    
    iab = null;
    if(db == 0){
      init();
    }else{
      userCheck();
    }
  }
};

function settingsCheck(){
  function strToBool(variable){
    switch(variable){
      case "true":
      return true;
      case "false":
      return false;
    }  
  }
  db.executeSql('SELECT count(*) AS tablecount FROM sqlite_master WHERE type = ? AND name = ?', ['table', 'setTable'], function(result) {
    for (var i = 0; i < result.rows.length; i++) {
      var row = result.rows.item(i);
    }
    if(row.tablecount == 1){
      db.executeSql('SELECT * FROM setTable', [], function(result){
        for (var i = 0; i < result.rows.length; i++) {
          var row = result.rows.item(i);
        
          if(row.setting == 'bio'){
            if(row.value == null){
              db.executeSql('INSERT INTO setTable (setting, value) VALUES (?, ?)', ['bio', false]);
              uBioLogin = false;
            }else{
              uBioLogin = strToBool(row.value);
            }
          }else if(row.setting == 'pin'){
            if(row.value == 1){
              db.executeSql('INSERT INTO setTable (setting, value) VALUES (?, ?)', ['bio', true]);
              uFiveMins = true;
            }else if(row.value == 0){
              db.executeSql('INSERT INTO setTable (setting, value) VALUES (?, ?)', ['bio', false]);
              uFiveMins = false;
            }else{
              uFiveMins = strToBool(row.value);
            }
          }
        }
        userCheck();
      });
    }else{
      db.executeSql('CREATE TABLE IF NOT EXISTS setTable (setting, value)');
      db.executeSql('INSERT INTO setTable (setting, value) VALUES (?,?)', ['pin', false]);
      db.executeSql('INSERT INTO setTable (setting, value) VALUES (?,?)', ['bio', false]);
      userCheck();
    }
  });
}

function userCheck(){


  db.executeSql('SELECT count(*) AS tablecount FROM sqlite_master WHERE type = ? AND name = ?', ['table', 'sosTable'], function(result) {
    for (var i = 0; i < result.rows.length; i++) {
        var row = result.rows.item(i);
    }
    if(row.tablecount == 1){
      db.executeSql('SELECT * FROM sosTable', [], function(result) {
        if (result != null && result.rows != null) {
          for (var i = 0; i < result.rows.length; i++) {
              var row = result.rows.item(i);
          }
          if(row.login != null) {  
            dataObj.pinCode = row.password;
            dataObj.phone = row.login;
            dataObj.signed = 1;
            init();
          } else { 
            dataObj.signed = 0;
            init();
          }
        }else{
          dataObj.signed = 0;
          init();
        }
      });
    } else {
      dataObj.signed = 0;
      init();
    }
  });

}

function init(){
  new Vue({
    el: '#app',
    render: (h) => h(App),
    store,
    components: {
      app: app
    },
    data:{
      db: db,
      fp: fp,
      iab: iab,
      apprate: apprate
    },
    mounted(){
      const self = this;
      self.$store.commit('setUserData', dataObj);
      self.$store.commit('setUserBioLogin', uBioLogin);
      self.$store.commit('setUserFiveMins', uFiveMins);

      // .handleNotificationOpened(notificationOpenedCallback, notificationReceivedCallback)
    }
  });
}