
try {
  const urlStr = "https://betixpro.com,https://betixpro.com";
  const redirectUrl = new URL(urlStr);
  redirectUrl.pathname = "/user/payments/deposit";
  redirectUrl.searchParams.set("status", "success");
  console.log("URL:", redirectUrl.toString());
} catch (e) {
  console.log("Error:", e.message);
}

try {
  const urlStr2 = "https://betixpro.com,https";
  const redirectUrl2 = new URL(urlStr2);
  redirectUrl2.pathname = "/user/payments/deposit";
  redirectUrl2.searchParams.set("status", "success");
  console.log("URL 2:", redirectUrl2.toString());
} catch (e) {
  console.log("Error 2:", e.message);
}
