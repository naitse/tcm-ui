define(function(require){

    var barman = require('barman');
    var $ = require('jquery');


    var Notificator = barman.Class.create({
       channel: "default-channel",
       //socketHost: "ws://localhost:8089/ws/notificator/",
       socketHost: "ws://50.16.102.175:8081/ws/notificator",
       identifier: Math.floor(Math.random()*10000),
       socket: null,
       debug: false,


        constructor: function (channel, host) {

            this.channel = (channel != null )?channel:this.channel;
            this.socketHost = (host != null )?host:this.socketHost;

            this.connect();

        },

       connect: function(host){
           var self = this;
           this.socketHost = (host != null )?host:this.socketHost;

           if(!this.socket){
               this.log("Connecting to socket " + this.socketHost );

               this.socket = new WebSocket(this.socketHost + this.channel);

               this.socket.onopen = function (){
                   self.onConnectionOpen(this);
               };
               this.socket.onmessage = function (evt) {

                   self.onMessageReceivedSuper(evt);

               };


           }else{
               this.log("Already connected to " + this.socketHost );
           }

       },

       sendMessage: function(event, data){

           this.connect();

           var message = {
               id: this.identifier,
               channel: this.channel,
               event: event,
               data: data
           }

           this.log("message to send: " + JSON.stringify(message) );

           this.socket.send(JSON.stringify(message));
       },

       onMessageReceivedSuper: function(e){

           var message = $.parseJSON(e.data);
           if(message != null){
               if(message.id ==null || message.id.toString().indexOf(this.identifier) < 0){
                this.log("message received: " + e.data );
                this.onMessageReceived(message);
               }
           }
       },

       onMessageReceived: function(message){

       },

        onConnectionOpen: function(conn){
            this.log("socket opened")

            if(conn.readyState ==1){

                var message = {
                    id: this.identifier,
                    channel: this.channel,
                    event: 'connected'
                }

                conn.send(JSON.stringify(message));
            }

        },

        log: function(message){
            if(this.debug) {console.log("Notificator", message)};
        }

    });

    return Notificator;

});

