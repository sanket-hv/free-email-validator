Steps to follow:

**Download the Repo:**

And Run below commands:

1. Install the packages:
**npm install**

2. Run the project:
**node app.js**

**3. Open Any API teting tools such as Postman and use below CURL"**

curl --location 'http://localhost:3000/validate-emails' \
--header 'Content-Type: application/json' \
--data-raw '{
  "emails": ["sanket@example.com", "sanket@example.com", "active@example.com"]
}'

**4. You will get active and inactive emails list in 2 different arrays in the response.**
