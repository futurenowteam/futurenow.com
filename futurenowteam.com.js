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
    var user = Meteor.users.findOne({ _id: this.params._id});
    if (typeof user !== "undefined") {
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
        $('.js-industry').removeClass('is-hidden');
      } else {
        $('.js-industry').addClass('is-hidden');
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
      var cegep = $('[name=cegep]').val();
      var cegep_program = $('[name=cegep_program]').val();
      var university = $('[name=university]').val();
      var university_program = $('[name=university_program]').val();

      Accounts.createUser({
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password,
        type: type,
        grad_year: grad_year,
        industry: industry,
        cegep: cegep,
        cegep_program: cegep_program,
        university: university,
        university_program: university_program
      }, function(error){
        console.log(error);
        if ( !error ) return Router.go('home');
        alert(error.reason || error.error)
      });
    }
  });
  Template.home.events({
    "change select": function (event) {
      var selected_industry = event.target.value;
      Session.set("industry", selected_industry)
    },
    "click .chevron-container": function (event) {
      var $chevron_container = $(event.target);
      var direction = $chevron_container.hasClass("chevron-container-left") ? "left" : "right";
      var industries = ['Technology and Engineering','Arts','Health and Science','Administration','Politics and Communication','Law','Education','Literature','Services','Others'];
      var current_industry = Session.get("industry");
      var current_industry_index = industries.indexOf(current_industry);
      var industries_number = industries.length;
      console.log(current_industry_index, industries_number, direction)
      var new_index;
      if (current_industry_index + 1 >= industries_number && direction === "right") {
        console.log("direction right")
        new_index = 0;
      } else if (current_industry_index == 0 && direction === "left") {
        new_index = industries.length - 1;
        console.log("direction left")
      } else {
        new_index = direction == "right" ? current_industry_index + 1 : current_industry_index - 1;
      }
      console.log(new_index)
      Session.set("industry", industries[new_index]);
    }
  })
  Template.home.onCreated(function () {
    Session.set("industry", "Technology and Engineering")
  });
  Template.home.helpers({
    "selected_industry": function(){
      return Session.get('industry')
    },
    hammerInitOptions: {
      velocity: 0.3
    },
    templateGestures: {
      'swipe body': function (event, templateInstance){
        console.log('test test');
      }
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
      console.log(this);
      return this;
    },
    'email': function(){
      return this.emails[0].address;
    },
    'starters': function(){
      console.log(Template.currentData())
      return [
        {starter: "Hi, how's it going?", email: Template.currentData().emails[0].address},
        {starter: "Yo", email: Template.currentData().emails[0].address}
      ]
    }
  });
  Template.registerHelper('sanitize',function(str){
    return str.replace(" ", "%20")
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
    },
    "click .btn": function(event){
      $(".btn").removeClass("active");
      $(event.target).addClass("active");
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
      console.log(options)
      if (!options.grad_year){
        throw new Meteor.Error("Please enter a graduation year")
      }
      if (!options.first_name){
        throw new Meteor.Error("Please enter a first name")
      }
      if (!options.last_name){
        throw new Meteor.Error("Please enter a last name")
      }
      if (!options.type){
        throw new Meteor.Error("Please choose either student or alumni")
      }
      if ( options.type == "alumni" && !options.industry){
        throw new Meteor.Error("Please choose an industry")
      }
      user.first_name = options.first_name;
      user.last_name = options.last_name;
      user.type = options.type;
      user.is_admin = false;
      user.grad_year = options.grad_year;
      user.industry = options.industry;
      user.cegep = options.cegep;
      user.cegep_program = options.cegep_program;
      user.university = options.university;
      user.university_program = options.university_program;
      return user;
    });
  });
}
