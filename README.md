# Redis, GraphQL and NodeJS
This example is to show the integration between redis and graphQL. GraphQL is a api to organize the any connection layer (but as far as i know it's only JSON), while Redis is a Database either on memory, session or persisted

## Install
Install redis server.

Install all packages with:
```
npm run Install
```

## Execute
Open 2 terminals with each running
```
  npm run start
```
```
  redis-server.exe //depends how to start the server there is also 'redis-server start'
```

## How to Execute
1. Browse http://localhost:8000/graphql
2. Do the first Query

```
query {
  message
}
```

OR


```
{
  message
}
```

3. Browse course

```
query {
    course(id:1) {
        title
        author
    }
}
```

3. Browse all course

```
query {
    courses {
        title
        author
    }
}
```

4. Specific Course

```
query {
    courses(topic:"JavaScript") {
      id
      title
      author
      description
      topic
      url
    }
}
```

5. Using fragment

```
fragment CourseInfo on Course {
  id
  title
  author
  description
  topic
  url
}

query {
    courses(topic:"Node.js") {
      ...CourseInfo
    }
}
```

6. Using variable, or, creating a function

```
query getSingleCourse($courseID: Int!) {
    course(id: $courseID) {
        title
        author
        description
        topic
        url
    }
}
```

In the variables do

```
{
    "courseID":1
}
```
