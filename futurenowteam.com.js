Router.route('/register');
Router.route('/login');
Router.route('/', {
  template: 'login'
});
Router.route('/home');
Router.route('/myprofile');
Router.route('profile', {
  path: '/users/:_id',
  data: function() {
    var user = Meteor.users.findOne(this.params._id);
    if (typeof user !== undefined) {
      Router.go(Meteor.absoluteUrl()+'users/'+user._id, {replaceState: true});
      return user;
    }
  }
});

if (Meteor.isClient) {
  Meteor.subscribe('all_users');

  Template.register.events({
    'click input[name="type"]': function (event) {
      if (event.target.value == "alumni") {
        $('.industry').removeClass('is-hidden');
      } else {
        $('.industry').addClass('is-hidden');
      }
    },
    'submit form': function (event) {
      event.preventDefault();
      var first_name = $('[name=first_name]').val();
      var last_name = $('[name=last_name]').val();
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      var type = $('[name=type]:checked').val();
      var grad_year = $('[name=grad_year]').val();
      var industry = $('[name=industry]:checked').val();

      Accounts.createUser({
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password,
        type: type,
        grad_year: grad_year,
        industry: industry,
      });
      Router.go('home');
    }
  });
  Template.home.events({
    "change select": function (event) {
      var selected_industry = event.target.value;
      Session.set("industry", selected_industry)
    }
  })
  Template.home.onCreated(function () {
    Session.set("industry", "technology")
  });
  Template.home.helpers({
    "selected_industry": function(){
      return Session.get('industry')
    },
    'alumni': function(){
      return Meteor.users.find( {type: "alumni", industry: Session.get("industry")});
    },
    'root_url': function(){
      return Meteor.absoluteUrl();
    }
  });

  Template.profile.helpers({
    'user': function(){
      return this;
    }
  });

  Template.myprofile.helpers({
    'current_user': function(){
      if (Meteor.user()) {
        return Meteor.user();
      }
    }
  });

  // Capitalize first letter
  UI.registerHelper('capitalizeString', function(context, options) {
    if (context) {
      return context.charAt(0).toUpperCase() + context.slice(1);
    }
  });

  // Get user's grad year string
  UI.registerHelper('getGradYear', function(context, options) {
    if (context) {
      var grad_year = context;
      var current_year = moment().month() >= 7 ? moment().year() + 1 : moment().year();
      var grad_year_string;

      if (grad_year < current_year) {
        grad_year_string = 'Graduated in '+ grad_year;
      } else if (grad_year == current_year) {
        grad_year_string = "Secondaire 5";
      } else if (current_year + 1 == grad_year) {
        grad_year_string = "Secondaire 4";
      } else if (current_year + 2 == grad_year) {
        grad_year_string = "Secondaire 3";
      } else if (current_year + 3 == grad_year) {
        grad_year_string = "Secondaire 2";
      } else if (current_year + 4 == grad_year) {
        grad_year_string = "Secondaire 1";
      } else {
        grad_year_string = "Primary";
      }
      return grad_year_string;
    }
  });

  Template.navigation.events({
    'click .logout': function(event){
      event.preventDefault();
      Meteor.logout();
      Router.go('login');
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
      user.industry = options.industry;
      return user;
    });
  });
}
