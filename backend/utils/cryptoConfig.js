import crypto from "crypto";

// Auto-generated public keys for signature verification
export const PUBLIC_KEYS = {
  "zomato": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA22lN07fN/9/QShYSUnPs\nciWHElPApmZYwABj3jNfcWOcygP4m6kF1WkWvhJJ1ZzojHkYUn2X0oGB4rRvahvX\nCPRDvbaF87HlDDMnuv/ZjIGxnW7VbVFbYHDQkRglIYT1Yhv/qtpo37lRXgav0SmH\nZwi9qMMIkU6hT0TpqHKkLdHaSk0X8UGCwGmkXa3Xn+Ou20/nAJEVhVe8t0L7zC1w\nAEwjpg3oh3wwq5Rr+VAqU/HQLwTzecZnjaWb961FnEFapDTSJ1W6wVc6kVJDIDNX\njUUTYcRS+qGEgLbHu6246NXmF65hEqyxbQjpQnsS265nOzfQdFq6CvJudh3AQwlT\nhwIDAQAB\n-----END PUBLIC KEY-----\n",
  "uber": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq18J0RuNLTh83GhGeOa5\nYgcj/ODpL7Hug9+Db/+g8W58QelLwIqS93Nm5t/aZgLokd7YXtpQGDj85X4MsKkZ\nUtIv0CtpYJgSbqYPsh5qSMaMf2syA+Lm40FgFLSUaLdBoyorLpjLm9y6rpOEywOK\n0lMvC3hZJ6ABf45Lm8OPDMePb3wupfxZSCK4JmTbJa4wAuZX5m+4dThYwUFIyi7I\n2LGV7M+bF9cDUEOSCXXJC5bnMGKJWOjxDeXj3GC4dIXTkjIR6zi7ZmA99jYvf4Il\nbgI9caC2m0uZWCj3azlCfSzxSngRGyEtGaNq0S1a8FDoGPHQFVimmbMRVH1UbC2O\nmwIDAQAB\n-----END PUBLIC KEY-----\n",
  "swiggy": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArdtzcSoEFA9b/M6ytcMk\n1fjdozmZx6zdjwBODpWLFrUJ6k34sRa8nnh8zYKHSa4KW1sQmdRk06MwLDx6EuT6\nKlDey7MUKOuqtXZUDFOMOZkYNe30BZQxZOsj/CVhLZvLETKFJQER9d4LPnytm66U\no5rjqVIRIMwrwT0O1XUPoxfAz7ZOKD+oqpmRgyAW1NYGggIRySR8J/5md7usxYFw\n2ctpYQYcdc+Zp2K8bex4APz66BHXqTIzMjLuiQ3VhoblLFramLyy0wmluKP8K/6j\nGDJ6fPbCfO4H+wuX2m+H1t3I+ROc28L0KV4kNr/YMugnE1eqjNpSzsjvire9sYgt\n8QIDAQAB\n-----END PUBLIC KEY-----\n",
  "ola": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA12HFI5/yiaQtAE3em9If\nZsvVuPAKoWYeiSlMTmTtoLHwvJR/b0HsI9KEvMcdeM4FJDw7lWAWG9wTMvowbicC\niOXEAQcXMwzv+38cChmkMxV9BYmKZh+MlYDcKvl0WfoEJweDW3wVbEk2vwq+K0kA\ndzdq5TwFl6yQ6AepLg9aoXNiV8uk3KWkSnjYtidMFb6MWdudcVlR9FZEIrthwbHr\n+rr2fyJkSNGalgANzEAVa3CcrjaunDoSK82UB1UPsELJXuPeZ2s8fG59QUJjg9rK\nRhPlTt98uNSbVvlCmXuEpoYV4yH5ga5wD/7Ke8ovql8fHcqjEIwFbGNZbXkC4tWB\n6wIDAQAB\n-----END PUBLIC KEY-----\n",
  "dunzo": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhBFKeKVrJ6drXvcQHHbs\nnCkRrMGRTWAyrpAl4sRs0Q7ZH+RyPNAYfuO8nCsBjHmu03pRZ401AjBg6uSFlWw7\nTrlT2izTpzA7puVx8A29I2KAMSbQGl9UOXaOB7Ro/dKHJWMvHyS8cJbM6FKtCzaT\nQ+Ni6IFT285Ti6t/nlbgpXUsAjLvqlKtyDl1DLuOKYYqhgSkvpZz4MhmV04H8Tve\nAUlZubXhLP2gRDFQcNbGlDzUzshezktLXkOd+d7C5uP5mUX14qwdWm/IWmA0RAfs\nuM3j/eurGiRX/ne4HGwa74C5+sRFXW6U32xAtT0lTF+82P6tqCMMzPfq3wWsnGRT\njwIDAQAB\n-----END PUBLIC KEY-----\n"
};

export function verifySignature(data, signatureBase64, publicKeyPem) {
  const verify = crypto.createVerify('SHA256');
  verify.update(JSON.stringify(data));
  verify.end();
  return verify.verify(publicKeyPem, signatureBase64, 'base64');
}
