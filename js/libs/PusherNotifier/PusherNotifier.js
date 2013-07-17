function PusherNotifier(channel, options) {
    var self = this;
    options = options || {};

    this.settings = {
        eventName: 'notification',
        title: 'Notification',
        titleEventProperty: null, // if set the 'title' will not be used and the title will be taken from the event
        image: 'assets/images/notify.png',
        eventTextProperty: 'message',
        gritterOptions: {}
    };

    $.extend(this.settings, options);


    channel.onMessageReceived = function(evt){
        var data = evt.data;
        var gritterOptions = {
            title: (self.settings.titleEventProperty? data[self.settings.titleEventProperty] : self.settings.title),
            text: data[self.settings.eventTextProperty].replace(/\\/g, ''),
            image: self.settings.image
        };

        $.extend(gritterOptions, self.settings.gritterOptions);

        $.gritter.add(gritterOptions);

    };
};