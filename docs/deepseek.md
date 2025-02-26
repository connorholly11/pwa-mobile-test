Your First API Call
The DeepSeek API uses an API format compatible with OpenAI. By modifying the configuration, you can use the OpenAI SDK or softwares compatible with the OpenAI API to access the DeepSeek API.

PARAM	VALUE
base_url *       	https://api.deepseek.com
api_key	apply for an API key
* To be compatible with OpenAI, you can also use https://api.deepseek.com/v1 as the base_url. But note that the v1 here has NO relationship with the model's version.

* The deepseek-chat model has been upgraded to DeepSeek-V3. The API remains unchanged. You can invoke DeepSeek-V3 by specifying model='deepseek-chat'.

* deepseek-reasoner is the latest reasoning model, DeepSeek-R1, released by DeepSeek. You can invoke DeepSeek-R1 by specifying model='deepseek-reasoner'.

Invoke The Chat API
Once you have obtained an API key, you can access the DeepSeek API using the following example scripts. This is a non-stream example, you can set the stream parameter to true to get stream response.

curl
python
nodejs
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <DeepSeek API Key>" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        "stream": false
      }'


      Skip to main content

DeepSeek API Docs Logo
DeepSeek API Docs
Quick StartModels & Pricing
On this page
Models & Pricing
The prices listed below are in unites of per 1M tokens. A token, the smallest unit of text that the model recognizes, can be a word, a number, or even a punctuation mark. We will bill based on the total number of input and output tokens by the model.

Pricing Details
MODEL(1)	deepseek-chat	deepseek-reasoner
CONTEXT LENGTH	64K	64K
MAX COT TOKENS(2)	-	32K
MAX OUTPUT TOKENS(3)	8K	8K
STANDARD PRICE
（UTC 00:30-16:30）	1M TOKENS INPUT (CACHE HIT)(4)	$0.07	$0.14
1M TOKENS INPUT (CACHE MISS)	$0.27	$0.55
1M TOKENS OUTPUT(5)	$1.10	$2.19
DISCOUNT PRICE(6)
（UTC 16:30-00:30）	1M TOKENS INPUT (CACHE HIT)	$0.035（50% OFF）	$0.035（75% OFF）
1M TOKENS INPUT (CACHE MISS)	$0.135（50% OFF）	$0.135（75% OFF）
1M TOKENS OUTPUT	$0.550（50% OFF）	$0.550（75% OFF）
(1) The deepseek-chat model points to DeepSeek-V3. The deepseek-reasoner model points to DeepSeek-R1.
(2) CoT (Chain of Thought) is the reasoning content deepseek-reasoner gives before output the final answer. For details, please refer to Reasoning Model。
(3) If max_tokens is not specified, the default maximum output length is 4K. Please adjust max_tokens to support longer outputs.
(4) Please check DeepSeek Context Caching for the details of Context Caching.
(5) The output token count of deepseek-reasoner includes all tokens from CoT and the final answer, and they are priced equally.
(6) DeepSeek API provides off-peak pricing discounts during 16:30-00:30 UTC each day. The completion timestamp of each request determines its pricing tier.
Deduction Rules
The expense = number of tokens × price. The corresponding fees will be directly deducted from your topped-up balance or granted balance, with a preference for using the granted balance first when both balances are available.

Product prices may vary and DeepSeek reserves the right to adjust them. We recommend topping up based on your actual usage and regularly checking this page for the most recent pricing information.

Token & Token Usage
Tokens are the basic units used by models to represent natural language text, and also the units we use for billing. They can be intuitively understood as 'characters' or 'words'. Typically, a Chinese word, an English word, a number, or a symbol is counted as a token.

Generally, the conversion ratio between tokens in the model and the number of characters is approximately as following:

1 English character ≈ 0.3 token.
1 Chinese character ≈ 0.6 token.
However, due to the different tokenization methods used by different models, the conversion ratios can vary. The actual number of tokens processed each time is based on the model's return, which you can view from the usage results.

Calculate token usage offline
You can run the demo tokenizer code in the following zip package to calculate the token usage for your intput/output.

Rate Limit
DeepSeek API does NOT constrain user's rate limit. We will try out best to serve every request.

However, please note that when our servers are under high traffic pressure, your requests may take some time to receive a response from the server. During this period, your HTTP request will remain connected, and you may continuously receive contents in the following formats:

Non-streaming requests: Continuously return empty lines
Streaming requests: Continuously return SSE keep-alive comments (: keep-alive)
These contents do not affect the parsing of the JSON body by the OpenAI SDK. If you are parsing the HTTP responses yourself, please ensure to handle these empty lines or comments appropriately.

If the request is still not completed after 30 minutes, the server will close the connection.

Error Codes
When calling DeepSeek API, you may encounter errors. Here list the causes and solutions.

                    CODE                    	DESCRIPTION
400 - Invalid Format	Cause: Invalid request body format.
Solution: Please modify your request body according to the hints in the error message. For more API format details, please refer to DeepSeek API Docs.
401 - Authentication Fails	Cause: Authentication fails due to the wrong API key.
Solution: Please check your API key. If you don't have one, please create an API key first.
402 - Insufficient Balance	Cause: You have run out of balance.
Solution: Please check your account's balance, and go to the Top up page to add funds.
422 - Invalid Parameters	Cause: Your request contains invalid parameters.
Solution: Please modify your request parameters according to the hints in the error message. For more API format details, please refer to DeepSeek API Docs.
429 - Rate Limit Reached	Cause: You are sending requests too quickly.
Solution: Please pace your requests reasonably. We also advise users to temporarily switch to the APIs of alternative LLM service providers, like OpenAI.
500 - Server Error	Cause: Our server encounters an issue.
Solution: Please retry your request after a brief wait and contact us if the issue persists.
503 - Server Overloaded	Cause: The server is overloaded due to high traffic.
Solution: Please retry your request after a brief wait.

DeepSeek-R1 Release
⚡ Performance on par with OpenAI-o1

📖 Fully open-source model & technical report

🏆 Code and models are released under the MIT License: Distill & commercialize freely!

🌐 Website & API are live now! Try DeepThink at chat.deepseek.com today!



🔥 Bonus: Open-Source Distilled Models!

🔬 Distilled from DeepSeek-R1, 6 small models fully open-sourced

📏 32B & 70B models on par with OpenAI-o1-mini

🤝 Empowering the open-source community

🌍 Pushing the boundaries of open AI!


📜 License Update!

🔄 DeepSeek-R1 is now MIT licensed for clear open access

🔓 Open for the community to leverage model weights & outputs

🛠️ API outputs can now be used for fine-tuning & distillation

🛠️ DeepSeek-R1: Technical Highlights

📈 Large-scale RL in post-training

🏆 Significant performance boost with minimal labeled data

🔢 Math, code, and reasoning tasks on par with OpenAI-o1

📄 More details: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf


🌐 API Access & Pricing

⚙️ Use DeepSeek-R1 by setting model=deepseek-reasoner

💰 $0.14 / million input tokens (cache hit)

💰 $0.55 / million input tokens (cache miss)

💰 $2.19 / million output tokens

📖 API guide: https://api-docs.deepseek.com/guides/reasoning_model



🚀 Introducing DeepSeek-V3
Biggest leap forward yet
⚡ 60 tokens/second (3x faster than V2!)
💪 Enhanced capabilities
🛠 API compatibility intact
🌍 Fully open-source models & papers


🎉 What’s new in V3
🧠 671B MoE parameters
🚀 37B activated parameters
📚 Trained on 14.8T high-quality tokens
🔗 Dive deeper here:

Model 👉 https://github.com/deepseek-ai/DeepSeek-V3
Paper 👉 https://github.com/deepseek-ai/DeepSeek-V3/blob/main/DeepSeek_V3.pdf
💰 API Pricing Update
🎉 Until Feb 8: same as V2!
🤯 From Feb 8 onwards:
Input (cache miss)	Input (cache hit)	Output
$0.27/M tokens	$0.07/M tokens	$1.10/M tokens
Still the best value in the market! 🔥


🌌 Open-source spirit + Longtermism to inclusive AGI
🌟 DeepSeek’s mission is unwavering. We’re thrilled to share our progress with the community and see the gap between open and closed models narrowing.
🚀 This is just the beginning! Look forward to multimodal support and other cutting-edge features in the DeepSeek ecosystem.
💡 Together, let’s push the boundaries of innovation!
