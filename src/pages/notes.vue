<template>
  <f7-page name="notes">
    <f7-navbar title="Заметки"></f7-navbar>
    <f7-messagebar placeholder="Новая заметка..." :value="messageText" @input="messageText = $event.target.value" @click="sendNote"  class="above-toolbar color-theme-blue">
      <f7-icon ios="f7:arrow_up_fill" aurora="f7:arrow_up_fill" md="material:send" slot="send-link"></f7-icon>
    </f7-messagebar>
    <div class="page-content page-content-notes no-margin bg-save-notes bg-save">
      <p v-if="notesNotFound" class="messages-not-found-p">Заметки не найдены</p>
      <f7-messages class="notes"></f7-messages>
    </div>
    <div id="updater" v-show="false" @click="showNotes">UPD</div>
  </f7-page>
</template>
<script>
  import moment from 'moment';

  export default {
    name: "notesview",
    data(){
      const db = this.$root.db;
      const messageBox = false;

      const notesNotFound = true;
      const messageText = '';

      return{
        db,
        messageBox,
        notesNotFound,
        messageText
      }
    },
    mounted(){
      this.init();
    },
    methods:{
      init(){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;

        self.notesBox = app.messages.create({
          el: '.notes',
          newMessagesFirst: true
        });
        if(self.db != 0){
          self.showNotes();
        }
      },
      showNotes(){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;
        self.notesBox.clear();
        self.db.transaction(function(tx){
          tx.executeSql('CREATE TABLE IF NOT EXISTS saveNotesTable(id INTEGER PRIMARY KEY, message, date)');
          tx.executeSql('SELECT * FROM saveNotesTable', [], function(tx, rs){
            if(rs.rows.length > 0){
              for (var i = 0; i < rs.rows.length; i++) {
                var row = rs.rows.item(i);
                self.notesBox.addMessage({
                  text: row.message,
                  type: 'sent',
                  header: row.date
                }, 'append');              
              } 
              self.notesNotFound = false;
            }
          });
        });
      },
      sendNote(){
        const self = this;
        const app = self.$f7;
        const $ = self.$$;
        const now = moment().format('YYYY-MM-DD hh:mm');
        self.db.transaction(function(tx){
          tx.executeSql('INSERT INTO saveNotesTable (message, date) VALUES (?,?)', [self.messageText, now]);
        }, function(error){
          console.log('transaction failed -', error.message)
        }, function(){
          self.notesBox.addMessage({
            text: self.messageText,
            type: 'sent',
            header: now
          }, 'append');  
          self.messageText = ""; 
        });
      },
    }
  }
</script>
