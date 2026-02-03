package com.example.TripGenie.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileRequest {
    public String UserName;
    public String phone;

    public String getUserName() { return UserName; }
    public void setUserName(String userName) { this.UserName = userName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
