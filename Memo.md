
# memo (Japanese)
## update cdk
```
$ sudo npm update -g aws-cdk
```
## tail Log
```
aws logs tail --follow  API-Gateway-Execution-Logs_gvrxxxx89/prod
```

ローカルで開発する場合は、Clientから起動してから先にdokcer containerで起動する。
meeting_URLはconsoleから取れる。

backend/lib/manager$ docker build -t hmm .

docker run -p 3000:3000 -v `pwd`:/work --env MEETING_URL="xxx"  --env BUCKET_ARN="xxx" dannadori/hmm


$ docker build -t dannadori/hmm . --no-cache
$ docker login
$ docker push dannadori/hmm 

### Cognito User Pool引継ぎ
（１）backendのconfigに次の二つの情報を設定
・古いUser PoolのIDとARN
・古いUser PoolのクライアントのID。cdk destroyで破壊されるので、consoleから作成。
　- クライアントシークレットを生成をチェックしない。