<template>
  <f7-page name="home">

      <f7-list class="margins-del">
        <f7-list-item title="Объект №" smart-select :smart-select-params="{openIn: 'sheet', sheetCloseLinkText: 'Готово', closeOnSelect: true}" class="smart-select-tall smartselect">
          <select name="objectselect" id="objectsel" @change="objectNumberChange">
            <option value="all" selected>Показать все</option>
          </select>
        </f7-list-item>

        <f7-row class="fab-morph-target bg-theme row-tall">
          <f7-col class="pan pan-input" width="30"><input type="text" id="dateone" placeholder="С" class="row-tall-input" /></f7-col>
          <f7-col class="pan pan-input" width="30"><input type="text" id="datetwo" placeholder="По" class="row-tall-input" /></f7-col>
          <f7-col class="pan" width="20"><f7-button class="row-tall-button" small-md fill @click="sendReview">Отчет</f7-button></f7-col>
          <f7-col class="pan pan-super" width="10"><f7-icon ios="f7:xmark" md="material:close" class="fab-close color-theme-gray"></f7-icon></f7-col>
        </f7-row>

      </f7-list>

    <f7-fab position="right-bottom" slot="fixed" morph-to=".row.fab-morph-target" class="super">
      <f7-icon ios="f7:search" md="material:search"></f7-icon>
      <f7-icon ios="f7:xmark" md="material:close"></f7-icon>
    </f7-fab>

    <messages ref="messagesComponentRef" @objected="tableObjects" />
    
    <f7-login-screen class="code-screen" :opened="codeScreenOpened" @loginscreen:closed="codeScreenOpened = false">
      <f7-page login-screen>
        <f7-login-screen-title>
          <div class="codeScreenLogo">
            <img src="static/ico.jpg" alt="logotype" class="codeScreenLogo-Jpg">
          </div>
          <p class="no-margin">Сэйв.<span class="lightweight-span">info</span></p>
        </f7-login-screen-title>
        <f7-block-header>{{pincodeString}}</f7-block-header>
        <f7-block>
          <f7-list>
            <f7-list-input
              :value="localPinCode"
              @input="localPinCode = $event.target.value"
              type="password"
              placeholder="4 цифры"
              v-on:input="typePinCode"
              autofocus
              outline
              maxlength="4"
            ></f7-list-input>
          </f7-list>
        </f7-block>
      </f7-page>
    </f7-login-screen>

    <f7-login-screen class="signup-screen" :opened="signupScreenOpened" @loginscreen:closed="signupScreenOpened = false">
      <f7-page login-screen>
        <f7-login-screen-title>
          <div class="codeScreenLogo">
            <img src="static/ico.jpg" alt="logotype" class="codeScreenLogo-Jpg">
          </div>
          <p class="no-margin">Сэйв.<span class="lightweight-span">info</span></p>
        </f7-login-screen-title>
        <f7-block-header>{{signupString}}</f7-block-header>
        <f7-block>
          <f7-list>
            <f7-list-input
              :value="localPhone"
              @input="localPhone = $event.target.value"
              id="validity"
              type="tel"
              placeholder="+7..."
              :info="formatString"
              pattern="^\+7\d\d\d\d\d\d\d\d\d\d$"
              clear-button
              autofocus
              outline
              maxlength="12"
              minlength="12"
            ></f7-list-input>
          </f7-list>
          <f7-row>
            <f7-col width="20"></f7-col>
            <f7-col width="60">
              <f7-button fill round large @click="typePhone">{{signupButton}}</f7-button>
            </f7-col>
            <f7-col width="20"></f7-col>
          </f7-row>
          <br>
            <f7-button v-if="newDeviceAbility" @click="startAddNewDevice">Привязать новое устройство</f7-button>
          
        </f7-block>
      </f7-page>
    </f7-login-screen>

  </f7-page>
</template>
<script>
  import { f7, f7ready } from 'framework7-vue';
  import moment from 'moment';
  import store from '../store/store.js';
  import messages from '@/components/messages.vue';

  import jquery from 'jquery';

  export default {
    name: 'homeview',
    components: {
      messages,
      Cleave
    },
    data(){
      const db = this.$root.db;
      const dataObj = this.$store.getters.getUserData;
      const apprate = this.$root.apprate;
      const fp = this.$root.fp;

      return{
        apprate,
        fp,
        lockTime: false,
        biometryDialogOpened: false,
        db,
        codeScreenOpened: false,
        signupScreenOpened: false,
        localPinCode: null,
        localPhone: null,
        pincodeString: 'Введите пин-код',
        signupString: 'Введите номер телефона',
        formatString: 'В формате +71234567890',
        signing: 0,
        proofPin: '',
        pushid: '',
        dataObj,
        frd: 0,
        srd: 0,
        dateonee: '',
        datetwoo: '',
        startedAddNewDevice: 0,
        phoneForNewDevice: '',
        phoneForMasterDevice: '',
        signupButton: 'Регистрация',
        newDeviceAbility: true,
      }
    },
    computed: {
      biometry: function(){
        return this.$store.getters.getUserBioLogin;
      },
      fivemins: function(){
        return this.$store.getters.getUserFiveMins;
      }
    },
    watch: {
      biometry: function(){
        return this.$store.getters.getUserBioLogin;
      },
      fivemins: function(){
        return this.$store.getters.getUserFiveMins;
      }
    },
    mounted(){
      if(this.fivemins == true){
        document.addEventListener("pause", this.onPause, false);
        document.addEventListener("resume", this.onResume, false);
      }else{
        document.addEventListener("resume", this.onResumeOne, false);
      }
      this.initialize();
    },
    methods: {
      onPause(){
        
        setTimeout(function() {
          this.lockTime = true;
        }, 120000);
      },
      onResume(){
        setTimeout(function() {
            if(this.lockTime == true){
              this.initialize();
            }
            this.lockTime=false;
        }, 500);
      },
      onResumeOne(){
        if(this.biometryDialogOpened == false){
          this.initialize();
        }
      },
      initialize(){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;
        if(self.dataObj.signed == 1){
          self.codeScreenOpened = true;
          if(self.biometry){
            self.biometryDialog()
          }
        }else{
          self.signupScreenOpened = true;
        }
      }, 
      biometryDialog(){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;

        self.biometryDialogOpened = true;

        self.fp.show({
          title: "Сэйв.info",
          description: "Войдите, используя отпечаток пальца.",
          cancelButtonTitle: "Отмена"
        }, function(success){

          setTimeout(function(){
            self.biometryDialogOpened = false;
          }, 300)
          self.loginServer(self.dataObj.pinCode);

        }, function(error){
          setTimeout(function(){
            self.biometryDialogOpened = false;
          }, 300)
          self.biometryDialog();
        });
      },
      typePinCode(e){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;
        var pin = self.localPinCode;
        pin = pin.toString().length;
        if(pin === 4){
          if(self.signing == 0){
            self.loginServer(self.localPinCode);
          }else if(self.signing == 1){
            self.proofPin = self.localPinCode;
            self.signing = 2;
            self.pincodeString = "Подтвердите пин-код";
            self.localPinCode = '';
          }else if(self.signing == 2){
            if(self.localPinCode == self.proofPin){
              self.signUp();
            }else{
              app.dialog.alert("Введенные пароли не совпадают, попробуйте еще раз.");
              self.pincodeString = 'Придумайте пин-код';
              self.localPinCode = '';
              self.signing = 1;
              self.proofPin = '';
            }
          }else if(self.signing == 5){
            self.signUp();
          }
        }
      },
      startAddNewDevice(){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;
        self.startedAddNewDevice = 1;
        self.newDeviceAbility = false;
        self.signupButton = 'Далее';
        self.signupString = 'Введите номер телефона основного аккаунта.';
      },
      typePhone(){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;

        const re = /^\+7\d{10}$/;

        if(!re.test(self.localPhone)){
          $('#validity').addClass('inp_inv');
          self.formatString = "Неверный формат.";
        }else{
          $('#validity').removeClass('inp_inv');
        }

        if(self.localPhone.length < 12){
          self.signupString = 'Проверьте количество символов';
        }else{
          if(self.startedAddNewDevice == 0){
            self.signupScreenOpened = false;
            self.codeScreenOpened = true;
            self.pincodeString = 'Придумайте пин-код';
            self.signing = 1;
          }else if(self.startedAddNewDevice == 1){ 
            self.phoneForMasterDevice = self.localPhone;
            self.signupString = 'Введите номер телефона для нового устройства. (обязательно)';
            self.localPhone = '';
            self.startedAddNewDevice = 2;
          }else if(self.startedAddNewDevice == 2){
            self.phoneForNewDevice = self.localPhone;
            if(self.phoneForNewDevice == self.phoneForMasterDevice){
              app.dialog.alert('Номера не должны совпадать.');
              self.localPhone = '';
              self.phoneForNewDevice = '';
            }else{
              self.signupScreenOpened = false;
              self.codeScreenOpened = true;
              self.pincodeString = 'Введите пин-код основного аккаунта';
              self.signing = 5;              
            }
          }
        }
      },
      signUp(){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;  
        let toastBottom;   
        
        let data = {
          password: self.localPinCode, 
          pushId: self.dataObj.pushid, 
          phoneType: device.manufacturer+' '+device.model
        };

        if(self.startedAddNewDevice == 2){
          data.login = self.phoneForMasterDevice.substring(1);
          data.login2 = self.phoneForNewDevice.substring(1);
        }else{
          data.login = self.localPhone.substring(1);
        }
        
        app.request.postJSON('https://infosave.pushmobile.ru/register', data, function(response){
          console.log(response, data, 'register');
          if(response.message == 'ok' || response.account == 'user found'){
            self.db.transaction(function(tx) {
                tx.executeSql('DROP TABLE IF EXISTS sosTable');
                tx.executeSql('CREATE TABLE IF NOT EXISTS sosTable(password, login)');
                tx.executeSql('INSERT INTO sosTable(password, login) VALUES(?, ?)', [self.localPinCode, self.localPhone]);
              }, function(error) {
                console.log('Transaction ERROR: ' + error.message);
              }, function() {
                if(self.startedAddNewDevice == 2){
                  app.dialog.confirm('Необходим перезапуск приложения.', function(){
                    navigator.app.exitApp();
                  });
                }else{
                  setTimeout(function () {
                    app.dialog.close();
                    self.codeScreenOpened = false;
                    self.signing = 0;
                    self.pincodeString = "Введите пин-код";
                    self.$store.commit('setClientSigned', 1);
                    self.$store.commit('setClientPinCode', self.localPinCode);
                    self.$store.commit('setClientPhone', self.startedAddNewDevice == 2 ? self.phoneForNewDevice : self.localPhone);
                    self.loginServer(data.password);
                    toastBottom = app.toast.create({
                      text: 'Регистрация успешно завершена.',
                      closeTimeout: 2000,            
                    });
                    toastBottom.open();
                  }, 2000);
                }
            });            
          } else{
            app.dialog.alert('Произошла ошибка, попробуйте позже.');
          }        
        }, function(xhr, status, message){
          app.dialog.alert('Ошибка сети. статус - '+ status + ', сообщение - ' +message);
        });
      },
      loginServer(pin){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;
        let phone = self.dataObj.phone;

        if(phone.startsWith('+')){
          console.log('+');
          phone = phone.substring(1);
        }

        let data = {
          account: phone,
          password: pin,
          phoneType: device.manufacturer+' '+device.model     
        };
        app.request.postJSON('https://infosave.pushmobile.ru/login', data, function(response){
          console.log(response, data, 'login');
          switch(response.message){
            case 'ok':
              if(self.dataObj.pinCode == pin){
                self.codeScreenOpened = false;
                self.$store.commit('setClientLogged', 1);
                self.$store.commit('setClientBalance', response.user.balance);
                self.$store.commit('setClientDogovor', response.user.dogovor);
                self.initPickers();
                self.localPinCode = '';
                if(self.db != 0){
                  self.$refs.messagesComponentRef.checkMessages();
                  self.apprate.promptForRating(false);
                }
              }else{
                self.pincodeString = 'Неверный пин-код. Повторите попытку.';
                self.localPinCode = "";
              }
            break;
            case 'error':
              if(response.account == 'not found'){
                app.dialog.alert('Аккаунт не найден.');
              }else if(response.account == 'not accept'){
                app.dialog.alert('Вход запрещен, так как устройство не активировано. Активируйте устройство в списке устройств в основном аккаунте и попробуйте ещё раз.');
              }
              self.localPinCode = '';
            break;
          }          
        }, function(xhr, status, message){
          app.dialog.alert('Ошибка сети. статус - '+ status + ', сообщение - ' +message);
        });
      },
      initPickers(){
        const self = this;
        const app = self.$f7;
        const $ = self.$$; 

        var myCalendarOne = app.calendar.create({
          inputEl: '#dateone',
          openIn: 'popover',
          dateFormat: 'yyyy-mm-dd',
          monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август' , 'Сентябрь' , 'Октябрь', 'Ноябрь', 'Декабрь'],
          dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
          on: {
            dayClick: function(p, dayContainer, year, month, day){
              self.frd = 1;
              if(parseInt(day) < 10){
                day = '0'+day;
              }
              month = parseInt(month)+1;
              if(parseInt(month) < 10){
                month = '0'+month;
              }
              $('input#dateone').val(year+'-'+month+'-'+day);
              self.dateonee = year+''+month+''+day;
              app.calendar.close();
              if(self.srd ==  1){
                self.$refs.messagesComponentRef.showDated(self.dateonee, self.datetwoo);
              }                    
            }
          }
        });   

        var myCalendarTwo = app.calendar.create({
          inputEl: '#datetwo',
          openIn: 'popover',
          dateFormat: 'yyyy-mm-dd',
          monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август' , 'Сентябрь' , 'Октябрь', 'Ноябрь', 'Декабрь'],
          dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
          on: {
            dayClick: function(p, dayContainer, year, month, day){
              self.srd = 1;
              if(parseInt(day) < 10){
                day = '0'+day;
              }
              month = parseInt(month)+1;
              if(parseInt(month) < 10){
                month = '0'+month;
              }
              $('input#datetwo').val(year+'-'+month+'-'+day);
              self.datetwoo = year+''+month+''+day;
              app.calendar.close();
              if(self.frd == 1){
                self.$refs.messagesComponentRef.showDated(self.dateonee, self.datetwoo);
              }                    
            }
          }
        });   
      },
      tableObjects(){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;
        // проверим наличие таблицы с объектами и псевдонимами - objectsTable и создадим, если таковая не имеется.
        self.db.transaction(function(tx){
          tx.executeSql('CREATE TABLE IF NOT EXISTS objectsTable(id INTEGER PRIMARY KEY, name, alias)');
          tx.executeSql('SELECT DISTINCT objnum FROM saveMessagesTable', [], function(tx, rxa) {
            if(rxa.rows.length != 0){
              for (var i = 0; i < rxa.rows.length; i++) {
                var row = rxa.rows.item(i);
                let objnum = row.objnum;
                if(objnum != '<>Нарушение' && objnum != ''){
                  tx.executeSql('SELECT * FROM objectsTable WHERE name = ?', [objnum], function(tx, rx){
                    if(rx.rows.length == 0){
                      tx.executeSql('INSERT INTO objectsTable(name) VALUES(?)', [objnum]);
                    }
                  });
                }
              }
            }else{
              console.log('объектов в таблице сообщений не найдено.');
            }
          });
        }, function(error){
          console.log('Transaction ERROR: ' + error.message);
        }, function(){
          let sObjects;
          let data = {
            account: self.dataObj.phone.substring(1),
            password: self.dataObj.pinCode
          };
          app.request.postJSON('https://infosave.pushmobile.ru/objects', data, function(response){
            console.log('assembleObjects response', response);
            if(response.message === 'ok'){
              sObjects = response.objects;
              self.assembleObjects(sObjects);
            }
          });
          
        });
      },
      assembleObjects(sObjects){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;
        self.$store.commit('clearObjects');
        $('select[name="objectselect"]').html('');
        $('select[name="objectselect"]').append('<option value="all">Показать все</option>');

        self.db.executeSql('SELECT * FROM objectsTable', [], function(result){
          console.log('sObjects - ', sObjects);
          let increment = 1;
          for(var i = 0; i < result.rows.length; i++) {
            var row = result.rows.item(i);
            let gObjName = row.name;
            let gAlias = row.alias;

            if(gAlias != null){
              $('select[name="objectselect"]').append('<option value="'+gObjName+'">'+gAlias+'</option>');
            }else{
              $('select[name="objectselect"]').append('<option value="'+gObjName+'">'+gObjName+'</option>');
            }
            
            let key = sObjects.find(obj => obj.object === gObjName);
            console.log('assemble', key, gObjName);

            let newObj = {
              status: key.state,
              name: gObjName,
              dated: key.date,
              id: increment,
              alias: gAlias
            };

            self.$store.commit('setObject', newObj);

            increment++;

          }
        });
      },
      objectNumberChange(){
        this.$refs.messagesComponentRef.objNumChange();
      },
      sendReview(){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;
        var objnumber = $('select[name="objectselect"]').val();
        if(dateone != "" && datetwo != ""){
          if(objnumber !== 'all'){
            app.dialog.prompt('Введите email на который нужно отправить отчет', function(value){
              app.request({
                type: "GET",
                url: "https://baykminer.ru/sos/senddoc1.php",
                headers: {
                  'header1': 'textos'
                },
                data: { 
                  'objnumber': objnumber, 
                  'dateone': self.dateonee+' 00:00:00', 
                  'datetwo': self.datetwoo+' 23:59:59', 
                  'value': value
                },
                crossDomain: true,
                cache: false,
                error: function(response){
                  app.dialog.alert('Нет подключения к интернету.', 'Сэйв: кнопка SOS'); 
                },
                success: function(response){
                  app.dialog.alert('Отчет будет отправлен на указанную почту в течение 5-ти минут!');
                }
              });
            });
           }else{
            app.dialog.alert('Выберите объект');
           }
        }else{
          app.dialog.alert('Выберите даты');
        }        
      }
    }
  };
</script>
