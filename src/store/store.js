import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userData: {
      signed: 0,
      logged: 0,
      pushid: '',
      pinCode: '',
      dogovor: '',
    },
    devices: [],
    uFiveMins: false,
    uBioLogin: false,
    objects: [   
    ],
    dictStatuses: [
      {
        id: 1,
        string: "Под охраной",
        icon: "lock_fill",
        colorClass: "text-color-green"
      },
      {
        id: 2,
        string: "Снят с охраны",
        icon: "lock_open_fill",
        colorClass: "text-color-orange"
      },
      {
        id: 3,
        string: "Откл. 220V",
        icon: "bolt_slash_fill",
        colorClass: "text-color-orange"
      },
      {
        id: 4,
        string: "Потоп",
        icon: "drop_fill",
        colorClass: "text-color-blue"
      },
      {
        id: 5,
        string: "Пожар",
        icon: "flame_fill",
        colorClass: "text-color-red"
      }
    ]

  },
  getters: {
    getClientSigned: state => {
      return state.userData.signed;
    },
    getClientLogged: state => {
      return state.userData.logged;
    },
    getClientPushId: state => {
      return state.userData.pushid;
    },
    getClientPinCode: state => {
      return state.userData.pinCode;
    },
    getUserData: state => {
      return state.userData;
    },
    getObjects: state => {
      return state.objects;
    },
    getDictStat: state => {
      return state.dictStatuses;
    },
    getUserBioLogin: state => {
      return state.uBioLogin;
    },
    getUserFiveMins: state => {
      return state.uFiveMins;
    },
    getDevices: state => {
      return state.devices;
    },
    getUserBalance: state => {
      return state.userData.balance;
    },
    getUserDogovor: state => {
      return state.userData.dogovor;
    },
  },
  mutations: {
    setUserBioLogin: (state, payload) => {
      state.uBioLogin = payload;
    },
    setUserFiveMins: (state, payload) => {
      state.uFiveMins = payload;
    },
    setClientSigned: (state, payload) => {
      state.userData.signed = payload;
    },
    setClientLogged: (state, payload) => {
      state.userData.logged = payload;
    },
    setClientPushId: (state, payload) => {
      state.userData.pushid = payload;
    },
    setClientPinCode: (state, payload) => {
      state.userData.pinCode = payload;
    },
    setClientPhone: (state, payload) => {
      state.userData.phone = payload;
    },
    setClientBalance: (state, payload) => {
      state.userData.balance = payload;
    },
    setClientDogovor: (state, payload) => {
      state.userData.dogovor = payload;
    },
    setUserData: (state, payload) => {
      state.userData = payload;
    },
    setObject: (state, payload) => {
      state.objects.push(payload);
    },
    renameObject: (state, payload) => {
      state.objects[parseInt(payload[0])-1].alias = payload[1];
    },
    updateObject: (state, payload) => {
      state.objects[parseInt(payload[0])-1].status = payload[1].state;
    },
    clearObjects: (state) => {
      state.objects = [];
    },
    setDevices: (state, payload) => {
      state.devices = payload;
    }
  },
})