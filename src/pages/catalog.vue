<template>
  <f7-page name="catalog">
    <f7-navbar title="Объекты">
      <f7-nav-right>
        <a href="" class="tooltip-init profile-link" data-tooltip="Чтобы переименовать объект, нажмите на его номер.">
          <i class="icon f7-icons">info_circle</i>
        </a>
      </f7-nav-right>


    </f7-navbar>
    <f7-block strong class="no-margin block-objects" v-show="objects.length == 0">
      <p>Объекты не найдены.</p>
    </f7-block>


    <f7-list media-list class="block-objects">
      <f7-list-item 
      class="obj-media-item"
      v-for="obj in objects"
      :key="obj.id"      
      >
        <div slot="title" @click="renameObj(obj.id, obj.name)">{{obj.alias != null ? obj.alias : "№ "+obj.name}}<span class="object-col-badge badge"> <f7-icon @click="renameObj(obj.id, obj.name)" class="object-col-rename-icon" f7="pencil"> </f7-icon> </span> <div class="if-alias-spain" v-show="obj.alias != null">№ {{obj.name}}</div></div>
        <f7-icon slot="media" :f7="dictStat[obj.status-1].icon" :class="dictStat[obj.status-1].colorClass" class="obj-media-item-status-icon"></f7-icon>
        <div slot="after" class="obj-media-item-post-block">
          <div class="obj-media-item-status-text" :class="dictStat[obj.status-1].colorClass">{{dictStat[obj.status-1].string }}</div>
          <div class="obj-media-item-status-date">{{obj.dated}}</div>
        </div>
        <f7-row v-if="obj.status == 5 || obj.status == 4" class="obj-media-item-row-btn">
          <f7-col width="40"></f7-col>
          <f7-col width="60" class="obj-media-item-btn">
            <f7-button fill small-md @click="objectDefault(obj.name, obj.id)">Устранено</f7-button>
          </f7-col>
        </f7-row>
      </f7-list-item>
    </f7-list>

</f7-page>
</template>
<script>
  import { f7, f7ready } from 'framework7-vue';
  import moment from 'moment';
  import store from '../store/store.js';

  export default {
    name: 'catalogview',
    components: {
    },
    data(){
      const db = this.$root.db;
      const dictStat = this.$store.getters.getDictStat;
      const dataObj = this.$store.getters.getUserData;
      return{
        dictStat,
        db,
        dataObj
      }
    },
    mounted(){
      this.initialize();
    },
    computed: {
      objects: function(){
        return this.$store.getters.getObjects;
      }
    },
    watch: {
      objects (newObj, oldObj) {
        return this.$store.getters.getObjects;
      }
    },
    methods: {
      initialize(){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;
      },
      getClass(stat){
        if(stat == 5 || stat == 4){
          return 'object-col-with-btn';
        }else{
          return 'dummy';
        }
      },
      objectDefault(num, id){
        const self = this;
        const app = self.$f7;

        let data = {
          object: num,
          password: self.dataObj.pinCode,
          account: self.dataObj.phone.substring(1)
        };

        app.request.postJSON('https://infosave.pushmobile.ru/object-default', data, function(response){
          console.log('refresh object ', data, response);
          if(response.message == 'ok'){ 
            let newObjData = response.object; 
            let payload = [id, newObjData];
            self.$store.commit('updateObject', payload);
          }else{
            console.log('error.', data, response);
          }
        });
      },
      renameObj(identifier, objectname){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;
        app.dialog.prompt('Переименуйте объект', function(resp){
          let arrToCommit = [identifier, resp];
          self.$store.commit('renameObject', arrToCommit);
          self.db.executeSql('UPDATE objectsTable SET alias = ? WHERE name = ?', [resp, objectname], function(){
            console.log('successful');
          });
        });
      }
    }
  };
</script>
