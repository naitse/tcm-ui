define(function(require){

    var barman = require('barman');
    var $ = require('jquery');
    var self=null;

    var Notificator = barman.Class.create({
       //socketHost: "ws://localhost:8089/ws/notificator/channel",
       socketHost: "ws://54.226.198.206:8081/ws/notificator/channel",
       identifier: Math.floor(Math.random()*10000),
       socket: null,
       debug: false,
       channel: "",

        constructor: function (channel, host) {
            self = this;
            this.channel = (channel != null )?channel:this.channel;
            this.socketHost = (host != null )?host:this.socketHost;

            this.connect();

        },

       connect: function(host){

           this.socketHost = (host != null )?host:this.socketHost;

           if(!this.socket){
               this.log("Connecting to socket " + this.socketHost );

               this.socket = new WebSocket(this.socketHost);

               this.socket.onopen = this.onConnectionOpen;
               this.socket.onmessage = this.onMessageReceivedSuper;
           }else{
               this.log("Already connected to " + this.socketHost );
           }

       },

       sendMessage: function(event, data){

           this.connect();

           var message = {
               id: this.identifier,
               event: event,
               data: data
           }
           this.log("message to send: " + JSON.stringify(message) );
           this.socket.send(JSON.stringify(message));
       },

       onMessageReceivedSuper: function(e){
           var message = $.parseJSON(e.data);
           if(message != null){
               if(message.id.toString().indexOf(self.identifier) < 0){
                self.log("message received: " + e.data );
                self.onMessageReceived(message);
               }
           }
       },

       onMessageReceived: function(message){

       },

        onConnectionOpen: function(){
            self.log("socket opened")
        },

        log: function(message){
            if(this.debug) {console.log("Notificator", message)};
        }

    });

    return Notificator;

});

