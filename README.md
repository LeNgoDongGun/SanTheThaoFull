1.Tải về 
2.Để chạy project này thì phải bật 2 terminal cùng lúc , lý do tại sao phải 2 terminal cùng lúc là vì (phải chạy backend thì bên fe mới load được dữ liệu)
  - 1 cái cd SanTheThaoAPI , sau đó dotnet run 
  - 1 cái cd SanTheThaoFE , npm install rồi npm start hoặc ng serve đều được

# cài 3 gói xác thực chính thức từ mic
dotnet add package Microsoft.AspNetCore.Authentication.Google
dotnet add package Microsoft.AspNetCore.Authentication.Facebook
dotnet add package AspNet.Security.OAuth.GitHub