package br.com.habitinhos.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "habitinhos.email")
public class EmailProperties {

  private String from = "Habitinhos <onboarding@resend.dev>";
  private String userAgent = "habitinhos-backend/1.0";
  private Resend resend = new Resend();

  public String getFrom() {
    return from;
  }

  public void setFrom(String from) {
    this.from = from;
  }

  public String getUserAgent() {
    return userAgent;
  }

  public void setUserAgent(String userAgent) {
    this.userAgent = userAgent;
  }

  public Resend getResend() {
    return resend;
  }

  public void setResend(Resend resend) {
    this.resend = resend;
  }

  public static class Resend {

    private String apiKey = "";
    private String baseUrl = "https://api.resend.com";

    public String getApiKey() {
      return apiKey;
    }

    public void setApiKey(String apiKey) {
      this.apiKey = apiKey;
    }

    public String getBaseUrl() {
      return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
      this.baseUrl = baseUrl;
    }
  }
}
