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


    channel.bind(this.settings.eventName, function(data){

        var gritterOptions = {
            title: (self.settings.titleEventProperty? data[self.settings.titleEventProperty] : self.settings.title),
            text: data.replace(/\\/g, ''),
            image: self.settings.image
        };

        $.extend(gritterOptions, self.settings.gritterOptions);

        $.gritter.add(gritterOptions);

    });
};