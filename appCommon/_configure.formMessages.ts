module AppCommon {
    export class FormMessages {
        static Required_Name_First = "First name is required.";
        static Required_Name_Last = "Last name is required.";
        static Required_Password = "Password is required.";
        static Required_OldPassword = "Current password is required.";
        static Required_ConfirmPassword = "Confirm password is required.";
        static Required_ConfirmPasswordShouldMatch = "Confirmed password must match password.";
        static Required_MobilePhone = "Mobile phone is required.";
        static Required_Phone = "Phone number is required.  e.g., 972-555-5555";
        static Required_Email = "Email is required.";
        static Required_ValetAppPinCode = "Valet App PIN Code is required.";
        static Required_Card_Number = "Card Number is required";
        static Required_CCV = "Card CCV is required";
        static Required_Card_Expiration = "Expiration is required";
        static Required_Card_Expiration_Pattern = "Please enter month and 4 digit year, e.g. 05/2019";
        static Required_NumberOfPeopleReturning = "Number of people returning is required.";

        static Format_Email = "Please enter a valid email address.";
        static Format_Password = "The password should be at least 8 characters in length.";
        static Format_Phone = "Must be a valid 10-digit phone number.  e.g., (972) 555-5555";
        static Format_ValetAppPinCode = "Must be exactly 6 digits. Must be unique.";
        static Format_ValetBadge = "Must be digits only, include any leading 0. Must be unique.";
        static Format_NumberOfPeopleReturning = "Must be at least 1 person returning.";

        static Placeholder_Password = "Password, at least 8 characters, any characters";
        static Placeholder_ConfirmPassword = "Confirm password";
        static Placeholder_OldPassword = "Current password";
        static Placeholder_Name_First = "First Name";
        static Placeholder_Name_Last = "Last Name";
        static Placeholder_MobilePhone = "Mobile Phone";
        static Placeholder_Phone = "Phone Number";
        static Placeholder_Email = "Email Address";
        static Placeholder_CCEmails = "Please enter valid emails delimited by ';'";
        static Placeholder_Card_Expiration = "MM / YYYY";
        static Placeholder_Card_Notes = "e.g. Buisness";
        static Placeholder_ValetAppPinCode: "Valet App PIN Code, exactly 6 digits";
        static Placeholder_ValetBadge: "Employee badge, include any leading 0";
        static Placeholder_Note = "Note";

        static Label_Prefix = "Prefix";
        static Label_Name_First = "First Name";
        static Label_Name_Middle = "Middle Name";
        static Label_Name_Last = "Last Name";
        static Label_Suffix = "Suffix";
        static Label_Other_Phone = "Other Phone";
        static Label_Notes = "Notes";
        static Label_Address_1 = "Address 1";
        static Label_Address_2 = "Address 2";
        static Label_City = "City";
        static Label_State = "State";
        static Label_Zip = "Zip";
        static Label_Button_Save = "Save Changes";
        static Label_Button_Cancel = "Cancel";
        static Label_Card_Number = "Card Number";
        static Label_Card_Expiration = "Expiration";
        static Label_Card_CCV = "CCV";
        static Label_Card_Notes = "Notes";
        static Label_Password = "Password";
        static Label_Pincode = "Valet App Pin Code";
        static Label_Badge = "Badge #";

        static Textarea_Characters_Remaining = "characters remaining";

        static Title_MailingAddress = "Mailing Address";
        static Title_OtherPhones = "Other Phones";
        static Title_Login = "Log in";
        static Title_Reset_Password = "Reset Password";

        // Do not have an account? Sign Up instead
        static Message_NoAccount = "Do not have an account? ";
        static Message_SignUp = "Sign Up";
        static Message_Instead = " instead";

        static Message_ForgotPassword = "Forgot password?";

        static Message_CancelPaymentEdit = "Are you sure you want to cancel editing this payment method?";
    }
}