# CUplatform
CUPlatform aims at providing an all-in-one platform including a comprehensive databank and discussion forum for CUHK students’ school life and learning purpose.

# Structure
### Registration
Visitor can apply for an account with user ID, CUHK email and password. Registration component will check validity of their personal information. Then, the password will be encrypted on the client side and transferred to a user record created in the database along with user ID and email. After that, it will notify the visitor that an account has been created.

### Authentication
When a login request is received, Authentication component will check the user ID and password input with the corresponding user record. If the input matches with the user record, it will bring the user to homepage.
If a user has made too many failed login requests, the user account will be locked temporarily. At this stage, the user may send a request to recover the password with the user’s email.

### User Profile Management
It allows user to change nickname and password, upload user icon and edit personal information. User Profile Management component will update the user record and notify the user that above changes have been made.

### Timetable
To access course’s information and resources, user must add the course to timetable. User can also arrange the courses and synchronize with Google Calendar using its API. In mobile version, the system can also automatically mute user’s phone during class.

### Course Information
User can rate the course, provide course summary and assessment method. User can also comment on course arrangement and teaching style of lecturer. When such requests are received, Course Information component will append them to the course information record and show them in reverse chronological order. Furthermore, the component can help users upload and retrieve past lecture notes and resources from resources list in the database.

### Trading Platform
Trading Platform component shows all available items according to their types and courses that the items are related to.
When a sell request is received, provided with desired price and item details, the component will create a new item record in the database and the item will be shown on the platform.
When a buy request is received, the component will arrange a chat room for negotiation. When both sides agree, the seller can send a sold request to put the item off the platform. The component will mark the item and will not be shown in future.

### Discussion
Discussion component shows all topics in reverse chronological order. User can only see the topics related to the user’s courses.
User can write a new topic about academic matters or other relevant topics. The component will create a discussion record in database. 
User can also reply to the topics. The component will append replies to the discussion record and show them to users.

### Messenger
User can send messages and receive messages from other users using DataChannel.js.
