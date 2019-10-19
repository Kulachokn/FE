Зайдя на сайт, сделали http - запрос на получение контента страницы. Далее было определено наличие двух изображений на странице, 
соответственно сделано еще два запроса на получение этих изображений. 



GET /wireshark-labs/HTTP-wireshark-file4.html HTTP/1.1
Host: gaia.cs.umass.edu
Connection: keep-alive
Pragma: no-cache
Cache-Control: no-cache
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3
Accept-Encoding: gzip, deflate
Accept-Language: ru-RU,ru;q=0.9

HTTP/1.1 200 OK
Date: Sat, 19 Oct 2019 11:36:37 GMT
Server: Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/5.4.16 mod_perl/2.0.10 Perl/v5.16.3
Last-Modified: Sat, 19 Oct 2019 05:59:03 GMT
ETag: "2ca-5953d25d1970b"
Accept-Ranges: bytes
Content-Length: 714
Keep-Alive: timeout=5, max=100
Connection: Keep-Alive
Content-Type: text/html; charset=UTF-8



GET /pearson.png HTTP/1.1
Host: gaia.cs.umass.edu
Connection: keep-alive
Pragma: no-cache
Cache-Control: no-cache
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36
Accept: image/webp,image/apng,image/*,*/*;q=0.8
Referer: http://gaia.cs.umass.edu/wireshark-labs/HTTP-wireshark-file4.html
Accept-Encoding: gzip, deflate
Accept-Language: ru-RU,ru;q=0.9

HTTP/1.1 200 OK
Date: Sat, 19 Oct 2019 11:36:37 GMT
Server: Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/5.4.16 mod_perl/2.0.10 Perl/v5.16.3
Last-Modified: Sat, 06 Aug 2016 10:08:14 GMT
ETag: "cc3-539645c7f1ee7"
Accept-Ranges: bytes
Content-Length: 3267
Keep-Alive: timeout=5, max=99
Connection: Keep-Alive
Content-Type: image/png



GET /~kurose/cover_5th_ed.jpg HTTP/1.1
Host: manic.cs.umass.edu
Connection: keep-alive
Pragma: no-cache
Cache-Control: no-cache
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36
Accept: image/webp,image/apng,image/*,*/*;q=0.8
Referer: http://gaia.cs.umass.edu/wireshark-labs/HTTP-wireshark-file4.html
Accept-Encoding: gzip, deflate
Accept-Language: ru-RU,ru;q=0.9

HTTP/1.1 200 OK
Date: Sat, 19 Oct 2019 11:36:37 GMT
Server: Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/5.4.16 mod_perl/2.0.10 Perl/v5.16.3
Last-Modified: Tue, 15 Sep 2009 18:23:27 GMT
ETag: "18a68-473a1e0e6e5c0"
Accept-Ranges: bytes
Content-Length: 100968
Keep-Alive: timeout=5, max=100
Connection: Keep-Alive
Content-Type: image/jpeg

