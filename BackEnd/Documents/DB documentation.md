### **the models and their content :**



|User|User Profile|Appointment|Notifications|Project|Task Attachment|Task Comment|Task Item|Team|Team Member|Team Progress Report|University Record|
|-|-|-|-|-|-|-|-|-|-|-|-|
|Id|id|id|id|id|id|id|id|id|id|id|id|
|user name|user id|date time|title|title|file path|content|title|project title|team id|completion rate|university email|
|email|full name|status|message|description|uploaded at|created at|description|supervisor id|user id|risk level|username|
|password hash|department|team id|created at|start date|task item id|task item id|status|// relation to user , collection of team member , collection of tasks , collection of appointments , collection of team progress reports|// relation to team and user|suggestions|passoword|
|role|total number of credits|link|// connected with user as a foreign key|end date|user id|user id|deadline|||generated at|full name|
|created at|is graduate|supervisor id||status|//relation ship to user and task item|parent comment id|team id|||team id|role|
||phone number|// appointment is related to a team||supervisor id||//relationship to task item , user , task comment (twice : as a parent comment and as a list of replies)|project id|||project id|department|
||// the user profile is a user|||// relation ship to team , user , tasks, and team progress reports|||//relationship to team , project , collection of comments , and collection of attachments|||// relationship to team and project|is graduate|
|||||||||||||



