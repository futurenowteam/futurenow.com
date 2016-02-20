Router.route('/register');
Router.route('/login');
Router.route('/', {
  template: 'login'
});
Router.route('/home');

if (Meteor.isClient) {
  Meteor.subscribe('all_users');

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
      Router.go('home');
    }
  });

  Template.home.helpers({
    'alumni': function(){
      return Meteor.users.find( {type: "alumni"});

    }
  })
}

if (Meteor.isServer) {
  Meteor.publish('all_users', function () {
    return Meteor.users.find({});
  });
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
