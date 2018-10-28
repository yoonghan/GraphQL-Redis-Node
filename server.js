var express = require('express');
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');
var redis = require('redis');

/**Important to note is that, client get/set are promises, to mitigate it, we're using es6 promises to overcome this**/
var client = redis.createClient();//createClient(host, port)
var asyncRedis = require("async-redis");
var asyncRedisClient = asyncRedis.decorate(client);

//Using async, as there is an await.
var writeIntoRedisDB = async function() {
  const coursesData = [
      {
          id: 1,
          title: 'The Complete Node.js Developer Course',
          author: 'Andrew Mead, Rob Percival',
          description: 'Learn Node.js by building real-world applications with Node, Express, MongoDB, Mocha, and more!',
          topic: 'Node.js',
          url: 'https://codingthesmartway.com/courses/nodejs/'
      },
      {
          id: 2,
          title: 'Node.js, Express & MongoDB Dev to Deployment',
          author: 'Brad Traversy',
          description: 'Learn by example building & deploying real-world Node.js applications from absolute scratch',
          topic: 'Node.js',
          url: 'https://codingthesmartway.com/courses/nodejs-express-mongodb/'
      },
      {
          id: 3,
          title: 'JavaScript: Understanding The Weird Parts',
          author: 'Anthony Alicea',
          description: 'An advanced JavaScript course for everyone! Scope, closures, prototypes, this, build your own framework, and more.',
          topic: 'JavaScript',
          url: 'https://codingthesmartway.com/courses/understand-javascript/'
      }
  ]

  //Store courseInfo into redis.
  await client.set('courseInfo', JSON.stringify(coursesData));
  console.log("Course written into Redis");
}

//Once connected to redis, the server will start.
client.on('connect', function() {
  console.log('Redis client connected');
  writeIntoRedisDB();
  var graphQL = new GraphQLApp();
});

client.on('error', function (err) {
  console.log('Something went wrong ' + err);
});

//App starts here
var GraphQLApp = function() {
  // Declare GraphQL schema
  var schema = buildSchema(`
      type Query {
          message: String
          course(id: Int!): Course
          courses(topic: String): [Course]
      },
      type Course {
          id: Int
          title: String
          author: String
          description: String
          topic: String
          url: String
      }
  `);

  /**Version using promises to return asynchronous response**/
  var getCourse = async function(args) {
      var id = args.id;
      return new Promise((resolve, reject) => {
        client.get('courseInfo').then(data => {
          const coursesData = JSON.parse(data);
          const result = coursesData.filter(course => {
              return course.id == id;
          })[0];
          resolve(result);
          //reject(error messages)
        })
        .catch(function(error) {
          reject(error);
        })
      })
  }

  /**Forcing to use es6 (on top of async-client) to return using await**/
  var getCourses = async function(args) {
    var coursesData = JSON.parse(await client.get('courseInfo'));

    if (args.topic) {
      var topic = args.topic;
      return coursesData.filter(course => course.topic === topic);
    } else {
      return coursesData;
    }
  }

  // Root resolver, depending on what query, trigger what type of return function.
  // message is special, having it hardcoded with hello world.
  var root = {
      message: () => 'Hello World!',
      course: getCourse,
      courses: getCourses
  };

  // Create an express server and a GraphQL endpoint
  var app = express();
  app.use('/graphql', express_graphql({
      schema: schema,
      rootValue: root,
      graphiql: true //Set true to enable a GraphQL Ui.
  }));
  app.listen(8000, () => console.log('Express GraphQL Server Now Running On localhost:8000/graphql'));
}
