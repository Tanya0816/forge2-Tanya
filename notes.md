In openclaw configuration -

1. `npm install -g openclaw` , need `node v-22` to install openclaw
2. then use openAi as provider
3. Add eastrouter api key
4. Add url given
5. Select Slack as the channel for communication
6. Used the json file to create slack app
7. Used bot token from slack in terminal
8. Used app toekn from slack in terminal
9. added channels to communcation in slack
10. Use `openclaw doctor` to check for any query.
11. If there is any query use `openclaw doctor --fix`.
12. 


In hermes

1. curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
2. For the terminal backend, choose `Keep current`
3. For the setup messaganing, choose - Slack
4. Create slack using the manifest given in terminal
5. Add bot token given in the created app.
6. Add app token given in the app.
7. Once the basic setup is done, run `hermes model`
8. Select `openAi` as the provider
9. select openAI api key option 
10. Select `z-ai/glm-5.1` as the model
11. If the desired model is not in the list, select custom model and add model name 
