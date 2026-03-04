### **the models and their content :**



|***User***|***User Profile***|***Appointment***|***Notifications***|***Project***|***Task Attachment***|<br />***Feedback***|***Task Item***|***Team***|***Team Member***|***Team Progress Report***|***University Record***|Registration Request|
|-|-|-|-|-|-|-|-|-|-|-|-|-|
|Id|id|id|id|id|id|id|id|id|id|id|id|id|
|user name|user id|date time|title|title|file path|content|title|project title|team id|completion rate|university email|university email|
|email|full name|status|message|description|uploaded at|created at|description|supervisor id|user id|risk level|username|status |
|password hash|department|team id|created at|start date|task item id|sender id|status|// relationship to user , collection of team member , collection of tasks , collection of appointments , collection of team progress reports|// relation to team and user|suggestions|password|requested at|
|role|total number of credits|link|user id|end date|user id|team id|deadline|||generated at|full name||
|created at|is graduate|supervisor id|// connected with user as a foreign key|status|//relation ship to user and task item|parent feedback id|team id|||team id|role||
|//relationship to user profile, collection of team members , collection of notifications , collection of task attachments , collection of team , collection of feedback|phone number|// appointment is related to a team||supervisor id||task item id|project id|||project id|department||
||// the user profile is a user|||// relation ship to team , user , task item, and team progress reports||//relationship to task item , user , team, feedback (as parent feedback and as list of replies)|//relationship to team , project , collection of comments , and collection of attachments|||// relationship to team and project|is graduate||
||||||||||||||



