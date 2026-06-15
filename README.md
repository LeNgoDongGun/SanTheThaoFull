1.Tải về 
2.Để chạy project này thì phải bật 2 terminal cùng lúc , lý do tại sao phải 2 terminal cùng lúc là vì (phải chạy backend thì bên fe mới load được dữ liệu)
  - 1 cái cd SanTheThaoAPI , sau đó dotnet run 
  - 1 cái cd SanTheThaoFE , npm install rồi npm start hoặc ng serve đều được


# cài thêm thư viện  google để đăng nhập với google
```
dotnet add package Microsoft.AspNetCore.Authentication.Google
```
# cài thêm thư viện facebook để đăng nhập với facebook
```
dotnet add package Microsoft.AspNetCore.Authentication.Facebook
```
# cài thêm thư viện githubđể đăng nhập với github
```
dotnet add package AspNet.Security.OAuth.GitHub
```