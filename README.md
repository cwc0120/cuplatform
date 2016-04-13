# CUplatform
CUPlatform aims at providing an all-in-one platform including a comprehensive databank and discussion forum for CUHK students’ school life and learning purpose.

# Routing

## Registration
Visitor can apply for an account with user ID, CUHK email and password. Registration component will check validity of their personal information. Then, the password will be encrypted and transferred to a user record created in the database along with user ID and email. After that, it will notify the visitor that an account has been created.

### Register
Server: `POST /api/register/`
Client: `Auth.register(newUser)`

Parameters: 
- `uid`: User ID, must be alphanumeric
- `email`: CUHK link email
- `pwd1`: User password, must be alphanumeric
- `pwd2`: Password confirmation

Output: none / error

## Authentication
When a login request is received, Authentication component will check the user ID and password input with the corresponding user record. If the input matches with the user record, it will bring the user to homepage.
If a user has made too many failed login requests, the user account will be locked temporarily. At this stage, the user may send a request to recover the password with the user’s email.

### Log in
Server: `POST /api/auth/`
Client: `Auth.login(user)`

Parameters:
- `uid`: User ID
- `pwd`: Password

Output: 
- `token`: Token for subsequent authentication
- `uid`: User ID
- `admin`: Admin right
- error

### Log out
Client: `Auth.logout()`

Parameters: none

Procedures: `token`, `uid`, `admin` are deleted and redirect to `index`.

Output: none

### Get token
Client: `Auth.getToken()`

Parameters: none

Output: `token`

### Set token
Client: `Auth.setToken()`

Parameters:
- `token`: Token for subsequent authentication
- `uid`: User ID
- `admin`: Admin right

Procedures: Parameters are stored in localStorage.

Output: none

## User Profile Management
It allows user to change nickname and password, upload user icon and edit personal information. User Profile Management component will update the user record and notify the user that above changes have been made. Besides, to access course’s information and resources, user must add the course to timetable.

### Get user's profile
Server: `GET /api/user/profile/:uid`
Client: `User.editProfile(uid)`

Parameters:
- `uid`: user ID

Output: 
- A user object containing `uid`, `admin`, `email`, `icon`, `gender`, `birthday`, `major`, `intro`, `points`, `updates`
- error

### Edit user's profile
Server: `PUT /api/user/profile/:uid`
Client: `User.find(uid, data)`

Parameters:
- `uid`: user ID
- `gender`
- `major`
- `intro`
- `birthday`

Output: 
- An updated user object
- error

### Upload icon
Server: `POST /api/user/icon/:uid`
Client: `User.uploadIcon(uid, data)`

Parameters:
- `uid`: user ID
- `img`: user's icon

Output: 
- An updated user object
- error

### Change password
Server: `PUT /api/user/pwd/:uid`
Client: `User.changePwd(uid, data)`

Parameters:
- `uid`: user ID
- `oldPwd`: old password
- `newPwd1`: new password
- `newPwd2`: new password confirmation

Output: 
- none

### Delete update messages from update center
Server: `DELETE /api/user/update/:updateid`
Client: `User.deleteUpdate(updateid)`

Parameters:
- `updateid`: update message's `_id`

Output: 
- An updated user object
- error

### Get items sold history
Server: `GET /api/user/buylist`
Client: `User.getSellList()`

Parameters:
- none

Output: 
- A list of item objects that are sold by the user
- error

### Get items bought history
Server: `GET /api/user/buylist`
Client: `User.getBuyList()`

Parameters:
- none

Output: 
- A list of item objects that are interested by the user
- error

### Get user's timetable
Server: `GET /api/user/timetable/:uid`
Client: `User.getTimetable(uid)`

Parameters:
- `uid`: user ID

Output: 
- A list of course objects containing `courseCode`, `courseName`, `schedule` that are added by the user
- error

### Edit user's timetable
Server: `PUT /api/user/timetable/:uid`
Client: `User.edittTimetable(uid, data)`

Parameters:
- `uid`: user ID
- `timetable`: array of `courseCode`

Output: 
- A list of course objects containing `courseCode`, `courseName`, `schedule` that are added by the user
- error

## Course Information
User can rate the course, provide course summary and assessment method. User can also comment on course arrangement and teaching style of lecturer. When such requests are received, Course Information component will append them to the course information record and show them in reverse chronological order. Furthermore, the component can help users upload and retrieve past lecture notes and resources from resources list in the database.

### Get department list
Server: `GET /api/dept/`
Client: `Dept.get()`

Parameters: none

Output: 
- A list of department objects
- error

### Create a new department (admin)
Server: `POST /api/dept/`
Client: `Dept.create(newDept)`

Parameters:
- `deptCode`: Department code
- `deptName`: Department name

Output: 
- A list of department objects
- error

### Get information of a department
Server: `GET /api/dept/:did`
Client: `Dept.getOne(did)`

Parameters:
- `did`: Department code

Output: 
- A department object
- error

### Edit information of a department (admin)
Server: `PUT /api/dept/:did`
Client: `Dept.edit(did, dept)`

Parameters:
- `did`: Department code
- `deptName`: Department name

Output: 
- An updated department object
- error

### Delete a department (admin)
Server: `DELETE /api/dept/:did`
Client: `Dept.delete(did)`

Parameters:
- `did`: Department code

Output: 
- A list of department objects
- error

### Get course list in a department
Server: `GET /api/course/:did`
Client: `Course.get(did)`

Parameters:
- `did`: Department code

Output: 
- A list of course objects containing `courseCode` and `courseName`
- error

### Create a course (admin)
Server: `POST /api/course/:did`
Client: `Course.create(did, newCourse)`

Parameters:
- `did`: Department code
- `courseCode`: Course code
- `courseName`: Course name
- `schedule`: Schedule in array form `[{'day', 'time', 'venue'}]`
- `prof`: Instructor

Output: 
- A list of course objects containing `courseCode` and `courseName`
- error

### Get information of a course
Server: `GET /api/course/info/:cid`
Client: `Course.getOne(cid)`

Parameters:
- `cid`: Course code

Output: 
- A course object
- error

### Edit information of a course (admin)
Server: `PUT /api/course/info/:cid`
Client: `Course.edit(cid, course)`

Parameters:
- `cid`: Course code
- `courseName`: Course name
- `schedule`: Schedule in array form `[{'day', 'time', 'venue'}]`
- `prof`: Instructor

Output: 
- An updated course object
- error

### Delete a course (admin)
Server: `DELETE /api/course/info/:cid`
Client: `Course.delete(cid)`

Parameters:
- `cid`: Course code

Output: 
- A list of course objects containing `courseCode` and `courseName`
- error

### Add comment on a course
Server: `POST /api/course/info/:cid`
Client: `Course.postInfo(cid, cm)`

Parameters:
- `cid`: Course code
- `rating`
- `outline`
- `assessMethod`
- `comment`

Output: 
- A course object
- error

### Delete a course comment (admin)
Server: `DELETE /api/course/info/:cid/:cmid`
Client: `Course.deleteInfo(cid, cmid)`

Parameters:
- `cid`: Course code
- `cmid`: `_id` of the comment

Output: 
- An updated course object
- error

### Get resource list of a course
Server: `GET /api/resource/:cid`
Client: `Resource.get(cid)`

Parameters:
- `cid`: Course code

Output: 
- A list of resource objects containing `name`, `dateOfUpload`, `uploader`
- error

### Create a resource
Server: `POST /api/resource/:cid`
Client: `Resource.create(cid, newResource)`

Parameters:
- `cid`: Course code
- `name`: Name of resource
- `description`: HTML is acceptable
- `file`: Only doc, docx, ppt, pptx, pdf with size < 10 MB are accepted.

Output: 
- A list of resource objects containing `name`, `dateOfUpload`, `uploader`
- error

### Get information of resource
Server: `GET /api/resource/info/:resid`
Client: `Resource.getOne(resid)`

Parameters:
- `resid`: resource's `_id`

Output: 
- A resource object
- error

### Download a resource
Server: `GET /api/resource/file/:resid`
Client: `Resource.getRes(resid)`

Parameters:
- `resid`: resource's `_id`

Output: 
- `file`
- error

### Edit a resource
Server: `PUT /api/resource/info/:resid`
Client: `Resource.edit(resid, resource)`

Parameters:
- `resid`: Resource code
- `name`: Name of resource
- `description`: HTML is acceptable

Output: 
- An updated resource object
- error

### Delete a resource (admin)
Server: `DELETE /api/resource/info/:resid`
Client: `Resource.delete(resid)`

Parameters:
- `resid`: resource's `_id`

Output: 
- A list of resource objects containing `name`, `dateOfUpload`, `uploader`
- error

### Add comment on a resource
Server: `POST /api/resource/info/:resid`
Client: `Resource.postComment(resid, cm)`

Parameters:
- `resid`: resource's `_id`
- `content`

Output: 
- An updated course object
- error

### Delete comment on a resource (admin)
Server: `DELETE /api/resource/info/:resid/:cmid`
Client: `Resource.postComment(resid, cmid)`

Parameters:
- `resid`: resource's `_id`
- `cmid`: comment's `_id`

Output: 
- An updated course object
- error

## Trading Platform
Trading Platform component shows all available items according to their types and courses that the items are related to.
When a sell request is received, provided with desired price and item details, the component will create a new item record in the database and the item will be shown on the platform.
When a buy request is received, the component will arrange a chat room for negotiation. When both sides agree, the seller can send a sold request to put the item off the platform. The component will mark the item and will not be shown in future.

### Get item list
Server: `GET /api/item/`
Client: `Item.get()`

Parameters: none

Output: 
- A list of item objects containing `deptCode`, `courseCode`, `name`, `price`, `priceFlexible`, `date`, `seller`, `img`
- error

### Sell an item
Server: `POST /api/item/`
Client: `Item.create(newItem)`

Parameters:
- `deptCode`
- `courseCode`
- `name`
- `description`: HTML is acceptable
- `img`: less then 1 MB is acceptable
- `price`
- `priceFlexible`

Output: 
- A list of item objects containing `deptCode`, `courseCode`, `name`, `price`, `priceFlexible`, `date`, `seller`, `img`
- error

### Get an item
Server: `GET /api/item/:itemid`
Client: `Item.getOne(itemid)`

Parameters:
- `itemid`: item's `_id`

Output: 
- An item object
- error

### Edit an item
Server: `PUT /api/item/:itemid`
Client: `Item.edit(itemid, item)`

Parameters:
- `itemid`: item's `_id`
- `name`
- `description`: HTML is acceptable
- `price`
- `priceFlexible`

Output: 
- An updated item object
- error

### Delete an item
Server: `DELETE /api/item/:itemid`
Client: `Item.delete(itemid)`

Parameters:
- `itemid`: item's `_id`

Output: 
- A list of item objects containing `deptCode`, `courseCode`, `name`, `price`, `priceFlexible`, `date`, `seller`, `img`
- error

### Interested in an item
Server: `POST /api/item/request/:itemid`
Client: `Item.interest(itemid)`

Parameters:
- `itemid`: item's `_id`

Output:
- An updated item object
- error

### Sell an item to a user
Server: `PUT /api/item/request/:itemid`
Client: `Item.transact(itemid, uid)`

Parameters:
- `itemid`: item's `_id`
- `uid`: buyer's user ID

Output:
- An updated item object
- error

### Uninterest an item
Server: `DELETE /api/item/request/:itemid`
Client: `Item.uninterest(itemid)`

Parameters:
- `itemid`: item's `_id`

Output:
- An updated item object
- error

## Discussion
Discussion component shows all topics in reverse chronological order. User can only see the topics related to the user’s courses.
User can write a new topic about academic matters or other relevant topics. The component will create a discussion record in database. 
User can also reply to the topics. The component will append replies to the discussion record and show them to users.

### Get thread list of a course
Server: `GET /api/thread/:cid`
Client: `Thread.get(cid)`

Parameters:
- `cid`: Course code

Output: 
- A list of thread objects containing `topic`, `content`, `author`, `dateOfUpdate`, `annoymous`
- error

### Create a thread
Server: `POST /api/thread/:cid`
Client: `Thread.create(cid, newThread)`

Parameters:
- `cid`: Course code
- `annoymous`: for secret mode
- `topic`
- `content`: HTML is acceptable

Output: 
- A list of thread objects containing `topic`, `content`, `author`, `dateOfUpdate`, `annoymous`
- error

### Get a thread
Server: `GET /api/thread/detail/:tid`
Client: `Thread.getOne(tid)`

Parameters:
- `tid`: thread's `_id`

Output: 
- A thread object
- error

### Edit a thread
Server: `PUT /api/thread/detail/:tid`
Client: `Thread.edit(tid, thread)`

Parameters:
- `tid`: thread's `_id`
- `content`: HTML is acceptable

Output: 
- An updated thread object
- error

### Delete a thread (admin)
Server: `DELETE /api/thread/detail/:tid`
Client: `Thread.delete(tid)`

Parameters:
- `tid`: thread's `_id`

Output: 
- A list of thread objects containing `topic`, `content`, `author`, `dateOfUpdate`, `annoymous`
- error

### Add comment on a thread
Server: `POST /api/thread/detail/:tid`
Client: `Thread.postComment(tid, cm)`

Parameters:
- `tid`: thread's `_id`
- `content`

Output: 
- An updated thread object
- error

### Delete comment on a thread (admin)
Server: `DELETE /api/thread/detail/:tid/:cmid`
Client: `Thread.deleteComment(tid, cmid)`

Parameters:
- `tid`: thread's `_id`
- `cmid`: comment's `_id`

Output: 
- An updated thread object
- error

## Messenger (preliminary)
User can send messages and receive messages from other users using socket.io.
### Authentication
Emit: `auth`

Parameter: an object containing `token`

Output: an updated online user list `clientList` will be broadcasted.

### Get chat record with a particular online user
Emit: `getChatRecord`

Parameter: an object containing `uid` of the user

Output: a chat record `chatRecord` is retrieved from database and is sent to the caller.

### Get past chat record
Emit: `getPastName`

Parameter: an object containing `uid` of the user

Output: array of `userID` who have chatted with the user is returned

### Send a new message
Emit: `sendNewMessage`

Parameter: an object containing
- `recipient`: recipient's `uid`
- `content`: message's content

Output: a message object `newMessage` is sent to recipient and caller.

### Disconnect
Emit: `disconnect`

Parameter: none

Output: an updated online user list `clientList` will be broadcasted.
