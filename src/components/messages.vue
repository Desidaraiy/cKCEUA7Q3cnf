<template>
    <div class="page-content-home page-content bg-save bg-save-main ">
        <p v-if="messagesNotFound" class="messages-not-found-p" >Сообщения не найдены</p>
        <f7-messages></f7-messages>
        <f7-row v-if="messagesFounded" class="btn-more-messages">
            <f7-col width="33"></f7-col>
            <f7-col width="33"><f7-button fill @click="showMore">БОЛЬШЕ</f7-button></f7-col>
            <f7-col width="33"></f7-col>
        </f7-row>
    </div>
</template>
<script>
  import { f7, f7ready } from 'framework7-vue';
  import moment from 'moment';
  import store from '../store/store.js';
  import jquery from 'jquery';
  export default {
    name: 'messages',
    components: {
    },
    data(){
        const messageBox = undefined;
        const smartSelect = undefined;
        const db = this.$root.db;
        return{
            db,
            show: false,
            messagesNotFound: true,
            messagesFounded: false,
            messageBox,
            msgs: 0,
            datedOne: false,
            datedTwo: false,
            datedThree: false,
            smartSelect
        }
    },
    computed: {
        logged: function(){
            return this.$store.getters.getClientLogged;
        },
        dataObject: function(){
            return this.$store.getters.getUserData;
        }
    },
    watch: {
        dataObject: function(){
            return this.$store.getters.getUserData;
        }
    },
    mounted(){
        const self = this;
        self.init();
    },
    methods: {
        init(){
            const self = this;
            const app = self.$f7;
            const $ = self.$$;
            self.messageBox = app.messages.create({
                el: '.messages',
                newMessagesFirst: true
            });
            $('.messages').on('click', '.message-text', function(event){
                let noteText = event.target.innerHTML;
                let noteDate = $(event.target).closest('.message-content').find('.message-header').html();
                let defaultText = noteText+' от '+noteDate;
                app.dialog.create({
                    title: "Сэйв.info",
                    text: "Добавление в заметки.",
                    content: '<div class="dialog-input-field input"><textarea class="dialog-textarea-super">'+defaultText+'</textarea></div>',
                    buttons: [
                        {
                            text: app.params.dialog.buttonCancel,
                            onClick: function(dialog){
                                dialog.close();
                            }
                        },
                        {
                            text: app.params.dialog.buttonOk,
                            onClick: function(dialog){
                                let textareaValue = dialog.$el.find('.dialog-textarea-super').val();
                                let now = moment().format('YYYY-MM-DD hh:mm');
                                self.db.transaction(function(tx){
                                    tx.executeSql('INSERT INTO saveNotesTable (message, date) VALUES (?,?)', [textareaValue, now])
                                });
                                $('#updater').click();
                                dialog.close();
                            }
                        }
                    ]
                }).open();
                event.preventDefault();
            });
        },
        checkMessages(){
            // решаем, скачивать все сообщения или докачиваем недостающие.
            const self = this;
            const app = self.$f7;
            const $ = self.$$;
            app.dialog.progress('Проверка сообщений...');
            $('select[name="objectselect"]').html('');
            self.db.executeSql('SELECT count(*) AS tablecount FROM sqlite_master WHERE type = ? AND name = ?', ['table', 'saveMessagesTable'], function(result) {
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows.item(i);
                }
                if(row.tablecount > 0){
                    self.db.executeSql('SELECT count(*) AS tablecounta FROM saveMessagesTable', [], function(resulte) {
                        for (var i = 0; i < resulte.rows.length; i++) {
                            var rowe = resulte.rows.item(i);
                        }
                        if(rowe.tablecounta !== 0){
                            self.db.executeSql('SELECT * FROM saveMessagesTable ORDER BY id DESC LIMIT 1', [], function(resulta) {
                                for (var i = 0; i < resulta.rows.length; i++) {
                                    var rowa = resulta.rows.item(i);
                                }
                                var threemonthsago = moment().subtract(3, 'months').format('YYYYMMDD');
                                self.db.transaction(function(tx){
                                    tx.executeSql('DELETE FROM saveMessagesTable WHERE substr(date,1,4)||substr(date,6,2)||substr(date,9,2) < ?', [threemonthsago]);
                                });
                                self.downloadingMessages(rowa.date);
                            });
                        }else{
                            self.downloadingAllMessages();
                        }
                    });
                }else{
                    self.db.executeSql('CREATE TABLE IF NOT EXISTS saveMessagesTable(id INTEGER PRIMARY KEY, title, message, date, readed, objnum)');
                    self.downloadingAllMessages();
                }
            });
        },
        downloadingMessages(lastdate){
            const self = this;
            const app = self.$f7;
            const $ = self.$$;

            let data = {
                account: self.dataObject.phone.substring(1),
                password: self.dataObject.pinCode,
                dateStart: lastdate
            };
            app.request.postJSON('https://infosave.pushmobile.ru/subjects', data, function(response){
                console.log('downloadingMessages response', response, data);
                if(response.message == 'ok'){
                    if(response.subjects.length !== 0){ 
                        let subjects = response.subjects;
                        if(subjects[subjects.length-1].date == lastdate){ 
                            $('select[name="objectselect"]').html('');
                            self.db.executeSql('SELECT DISTINCT objnum FROM saveMessagesTable', [], function(result) {
                                for (var i = 0; i < result.rows.length; i++) {
                                    var row = result.rows.item(i);
                                    $('select[name="objectselect"]').prepend('<option value="'+row.objnum+'">'+row.objnum+'</option>');
                                }
                            });
                            $('select[name="objectselect"]').prepend('<option value="all">Показать все</option>');
                            self.showMessages();  
                        }else{
                            self.db.executeSql('DELETE FROM saveMessagesTable WHERE date = ?', [lastdate]);
                            jquery.each(subjects, function(i, field){
                                self.db.transaction(function(tx){
                                    tx.executeSql('INSERT INTO saveMessagesTable(title, message, date, readed, objnum) VALUES(?, ?, ?, ?, ?)', [1, field.message, field.date, 0, field.obj_num]);
                                });
                            }); 
                            $('select[name="objectselect"]').html('');
                            self.db.executeSql('SELECT DISTINCT objnum FROM saveMessagesTable', [], function(result) {
                                for (var i = 0; i < result.rows.length; i++) {
                                    var row = result.rows.item(i);
                                    $('select[name="objectselect"]').prepend('<option value="'+row.objnum+'">'+row.objnum+'</option>');
                                }
                            });
                            $('select[name="objectselect"]').prepend('<option value="all">Показать все</option>');
                            self.showMessages();   
                        }   
                    } else {
                        $('select[name="objectselect"]').html('');
                        self.db.executeSql('SELECT DISTINCT objnum FROM saveMessagesTable', [], function(result) {
                            for (var i = 0; i < result.rows.length; i++) {
                                var row = result.rows.item(i);
                                $('select[name="objectselect"]').prepend('<option value="'+row.objnum+'">'+row.objnum+'</option>');
                            }
                        });
                        $('select[name="objectselect"]').prepend('<option value="all">Показать все</option>');
                        self.showMessages();  
                    }
                }else{
                    app.dialog.alert('ошибка сети.');                    
                }
            });

        },
        downloadingAllMessages(){
            const self = this;
            const app = self.$f7;
            const $ = self.$$;  
            app.dialog.close();
            app.dialog.progress('Загрузка сообщений с сервера...');

            let data = {
                account: self.dataObject.phone.substring(1),
                password: self.dataObject.pinCode
            };
            
            app.request.postJSON('https://infosave.pushmobile.ru/subjects', data, function(response){
                console.log('downloadingAllMessages response', response, data);
                if(response.message == 'ok'){
                    if(response.subjects.length !== 0){ 
                        let subjects = response.subjects;
                        self.db.executeSql('CREATE TABLE IF NOT EXISTS saveMessagesTable(id INTEGER PRIMARY KEY, title, message, date, readed, objnum)');
                        self.db.transaction(function(tx){
                            jquery.each(subjects, function(i, field){
                                tx.executeSql('INSERT INTO saveMessagesTable(message, date, objnum) VALUES(?, ?, ?)', [field.message, field.date, field.obj_num]);
                            });                            
                        });
                        $('select[name="objectselect"]').html('');
                        self.db.executeSql('SELECT DISTINCT objnum FROM saveMessagesTable', [], function(result) {
                            for (var i = 0; i < result.rows.length; i++) {
                                var row = result.rows.item(i);
                                $('select[name="objectselect"]').prepend('<option value="'+row.objnum+'">'+row.objnum+'</option>');
                            }
                        });
                        $('select[name="objectselect"]').prepend('<option value="all">Показать все</option>');
                        self.showMessages();
                    }else{
                        app.dialog.close();
                        self.messagesNotFound = true;
                    }                    
                }else{
                    app.dialog.close();
                    app.dialog.alert('ошибка сети.');
                }
            });

            // app.request({
            //     type: "GET",
            //     url: "https://baykminer.ru/sos/pushes.php",
            //     data: { 
            //         uid: self.dataObject.pushid
            //     },
            //     crossDomain: true,
            //     cache: false,
            //     success: function(response){
            //         response = JSON.parse(response);
            //         if(response.status != 'empty'){ 
            //             self.db.executeSql('CREATE TABLE IF NOT EXISTS saveMessagesTable(id INTEGER PRIMARY KEY, title, message, date, readed, objnum)');

            //             self.db.transaction(function(tx){
            //                 jquery.each(response, function(i, field){
            //                     tx.executeSql('INSERT INTO saveMessagesTable(message, date, objnum) VALUES(?, ?, ?)', [field.message, field.date, field.obj_num]);
            //                 });                            
            //             });

            //             $('select[name="objectselect"]').html('');
            //             self.db.executeSql('SELECT DISTINCT objnum FROM saveMessagesTable', [], function(result) {
            //                 for (var i = 0; i < result.rows.length; i++) {
            //                     var row = result.rows.item(i);
            //                     $('select[name="objectselect"]').prepend('<option value="'+row.objnum+'">'+row.objnum+'</option>');
            //                 }
            //             });
            //             $('select[name="objectselect"]').prepend('<option value="all">Показать все</option>');
            //             self.showMessages();
            //         }else{
            //             app.dialog.close();
            //             self.messagesNotFound = true;
            //         }
            //     },
            //     error: function(error){
            //         app.dialog.close();
            //         app.dialog.alert('ошибка сети. '+error.message);
            //     }
            // });  
        },
        showMessages(){
            const self = this;
            const app = self.$f7;
            const $ = self.$$;  

            self.messageBox.clear();
            self.messagesFounded = true;
            self.messagesNotFound = false;

            self.db.executeSql('SELECT * FROM saveMessagesTable ORDER BY id DESC LIMIT 50', [], function(result) {
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows.item(i);
                    self.messageBox.addMessage({
                        text: row.message,
                        type: 'received',
                        header: row.date
                    }, 'append');
                }
                if(parseInt(result.rows.length) < 50){
                    self.messagesFounded = false;
                }else if(parseInt(result.rows.length) < 1){
                    self.messagesNotFound = true;
                }
                self.msgs = 50;  
                app.dialog.close();
                self.$emit('objected');

            }); 
        },
        showMore(){
            const self = this;
            const app = self.$f7;
            const $ = self.$$;      
            console.log('кнопка больше - нажата');
            var objnumber = $('select[name="objectselect"]').val();
            var query = '';
            var variables = [];
            switch(true){
                case self.datedOne: 
                    query = 'SELECT date, message FROM saveMessagesTable WHERE substr(date,1,4)||substr(date,6,2)||substr(date,9,2) BETWEEN ? AND ? ORDER BY id DESC LIMIT ?, ?';
                    variables = [self.dateonee, self.datetwoo, self.msgs, 50]
                break;
                case self.datedTwo:
                    query = 'SELECT date, message FROM saveMessagesTable WHERE objnum = ? AND substr(date,1,4)||substr(date,6,2)||substr(date,9,2) BETWEEN ? AND ? ORDER BY id DESC LIMIT ?, ?';
                    variables = [objnumber, self.dateonee, self.datetwoo, self.msgs, 50]; 
                break;
                case self.datedThree:
                    query = 'SELECT date, message FROM saveMessagesTable WHERE substr(date,1,4)||substr(date,6,2)||substr(date,9,2) = ? ORDER BY id DESC LIMIT ?, ?';
                    variables = [self.dateonee, self.msgs, 50]; 
                break;
                default:
                    if(objnumber == 'all'){
                        query = 'SELECT * FROM saveMessagesTable ORDER BY id DESC LIMIT ?, ?';
                        variables = [self.msgs, 50];
                    }else{
                        query = 'SELECT * FROM saveMessagesTable WHERE objnum = ? ORDER BY id DESC LIMIT ?, ?';
                        variables = [objnumber, self.msgs, 50];
                    }
                break;
            }
            self.db.executeSql(query, variables, function(result){
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows.item(i);
                    self.messageBox.addMessage({
                        text: row.message,
                        type: 'received',
                        header: row.date
                    }, 'append');
                }
                if(parseInt(result.rows.length) < 50){
                    self.messagesFounded = false;                   
                }   
                self.msgs += 50;              
            });
        },
        showDated(dateonee, datetwoo){
            const self = this;
            const app = self.$f7;
            const $ = self.$$;              
            var objnumber = $('select[name="objectselect"]').val();
            var query = '';
            var variables = [];
            self.messageBox.clear();
            self.messagesNotFound = false;
            if(parseInt(datetwoo) > parseInt(dateonee)){
                if(objnumber == 'all'){
                    query = 'SELECT date, message FROM saveMessagesTable WHERE substr(date,1,4)||substr(date,6,2)||substr(date,9,2) BETWEEN ? AND ? ORDER BY id DESC LIMIT 50';
                    variables = [dateonee, datetwoo];
                    self.datedOne = true;
                }else{
                    query = 'SELECT date, message FROM saveMessagesTable WHERE objnum = ? AND substr(date,1,4)||substr(date,6,2)||substr(date,9,2) BETWEEN ? AND ? ORDER BY id DESC LIMIT 50';
                    variables = [objnumber, dateonee, datetwoo];
                    self.datedTwo = true;
                }
            }else if(parseInt(datetwoo) == parseInt(dateonee)){
                query = 'SELECT date, message FROM saveMessagesTable WHERE substr(date,1,4)||substr(date,6,2)||substr(date,9,2) = ? ORDER BY id DESC LIMIT 50';
                variables = [dateonee];
                self.datedThree = true;
            }else{
                app.dialog.alert('Даты выбраны неправильно');
                self.messagesNotFound = true;
            }
            self.db.executeSql(query, variables, function(result) {
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows.item(i);
                    self.messageBox.addMessage({
                        text: row.message,
                        type: 'received',
                        header: row.date
                    }, 'append');
                }
                if(parseInt(result.rows.length) < 1){
                    self.messagesFounded = false;
                    self.messagesNotFound = true;
                }else if(parseInt(result.rows.length) < 50){
                    self.messagesFounded = false;
                }
                msgs = 50;
            });
        },
        objNumChange(){
            const self = this;
            const app = self.$f7;
            const $ = self.$$;                
            self.messageBox.clear();
            var objnumber = $('select[name="objectselect"]').val();

            $('input#dateone').val('');
            $('input#datetwo').val('');
            self.datedOne = false;
            self.datedTwo = false; 
            self.datedThree = false;
            self.msgs = 0;
            if(objnumber == 'all'){
                self.showMessages();
            }else{
                self.msgs = 50;
                self.messagesFounded = true;
                self.db.executeSql('SELECT * FROM saveMessagesTable WHERE objnum = ? ORDER BY id DESC LIMIT 50', [objnumber], function(result) {
                    for (var i = 0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        self.messageBox.addMessage({
                            text: row.message,
                            type: 'received',
                            header: row.date
                        }, 'append');
                    }
                    if(parseInt(result.rows.length) < 50){
                        self.messagesFounded = false;
                    }
                });
            }            
        }
    },
  };
</script>
