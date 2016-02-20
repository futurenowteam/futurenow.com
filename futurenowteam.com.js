if (Meteor.isClient) {

  Template.register.events({
    'submit form': function (event) {
      event.preventDefault();
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      var type = $('input:checked').val();

      Accounts.createUser({
        email: email,
        password: password,
        type: type
      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
