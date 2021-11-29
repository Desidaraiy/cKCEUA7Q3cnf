<template>
    <f7-page name="catalog">
        <f7-navbar title="Устройства" back-link></f7-navbar>
        <f7-block strong class="no-margin" v-show="devices.length == 0">
        <p>Устройства не найдены.</p>
        </f7-block>
        <f7-list media-list class="no-margin">
            <f7-list-item
                v-for="(device, index) in devices"
                :key="`device-${index}`"
                :subtitle="device.phoneType"
                :title="`+${device.account}`">
            <f7-icon slot="media" class="super-device-icon" f7="device_phone_portrait"></f7-icon>
            <f7-button slot="after" small :disabled="device.active == 1" @click="activate(device.account)">{{device.active == 1 ? 'Активен' : 'Включить'}}</f7-button>
            </f7-list-item>
        </f7-list>

    </f7-page>
</template>
<script>

export default {
    name: 'devices',
    components: {},
    data(){
        const db = this.$root.db;
        const dataObj = this.$store.getters.getUserData;
        return{
            db,
            dataObj
        }
    },
    computed: {
      devices () {
        return this.$store.getters.getDevices;
      }
    },
    watch: {
      devices (newObj, oldObj) {
        return this.$store.getters.getDevices;
      }
    },
    mounted(){
        this.init();
    },
    methods: {
        init(){
            const self = this;
            const app = self.$f7;

            let data = {
                account: self.dataObj.phone.substring(1)
            };
            app.request.postJSON('https://infosave.pushmobile.ru/get-phones', data, function(response){
                if(response.phones.length > 0){
                    let devices = response.phones;
                    self.$store.commit('setDevices', devices);
                }
            });
        },
        activate(login){
            const self = this;
            const app = self.$f7;
            let data = {
                account: login,
                login: self.dataObj.phone.substring(1),
                password: self.dataObj.pinCode
            };
            app.request.postJSON('https://infosave.pushmobile.ru/add-phone', data, function(response){
                self.init();
            });            
        }
    }

}
</script>
