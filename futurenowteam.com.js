if (Meteor.isClient) {

  Template.register.events({
    'submit form': function (event) {
      event.preventDefault();
      var first_name = $('[name=first_name]').val();
      var last_name = $('[name=last_name]').val();
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      var type = $('input:checked').val();

      Accounts.createUser({
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password,
        type: type
      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Accounts.onCreateUser(function(options, user) {
      user.first_name = options.first_name;
      user.last_name = options.last_name;
      user.type = options.type;
      user.is_admin = false;
      return user;

    })
    // code to run on server at startup
  });
}
