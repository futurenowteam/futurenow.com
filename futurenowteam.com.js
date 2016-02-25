Router.route('/register');
Router.route('/login');
Router.route('/', {
  template: 'login'
});
Router.route('/home');
Router.route('/profile');

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
      var grad_year = $('[name=grad_year]').val();

      Accounts.createUser({
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password,
        type: type,
        grad_year: grad_year,
      });
      Router.go('home');
    }
  });

  Template.home.helpers({
    'alumni': function(){
      return Meteor.users.find( {type: "alumni"});
    }
  });

  Template.profile.helpers({
    'current_user': function(){
      console.log(Meteor.user());
      return Meteor.user();
    }
  });

  // Capitalize first letter
  UI.registerHelper('capitalizeString', function(context, options) {
    if (context) {
      return context.charAt(0).toUpperCase() + context.slice(1);
    }
  });

  Template.navigation.events({
    'click .logout': function(event){
      event.preventDefault();
      Meteor.logout();
      Router.go('login');
    },
    'click .profile': function(event){
      event.preventDefault();
      Router.go('profile');
    }
  });

  Template.login.events({
    'submit form': function(event){
      event.preventDefault();
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      Meteor.loginWithPassword(email, password);
      Router.go('home');
    }
  });
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
      user.grad_year = options.grad_year;
      return user;

    })
    // code to run on server at startup
  });
}
