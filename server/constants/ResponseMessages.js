module.exports = {
    common: {
        parameter_store_post_success: "Parameter Stored to AWS Successfully",
        parameter_store_post_error: "Error while Parameter Store to AWS",
        parameter_data_found: "Here is a parameter data",
        parameter_data_not_found: "Invalid Parameter Name",
        aws_error: "AWS Authenitication Failure",
        email_sent_error: "Error while sending email",
        email_sent_success: "Email Action Triggered",
        sms_sent_error: "Error while sending sms",
        sms_sent_success: "SMS Action Triggered",
        file_upload_error: "Unable to upload file to AWS S3",
        file_upload_success: "File uploaded to AWS S3",
        no_video_file: "Please select a video file to proceed",
        no_video_thumb_file: "Please select a video thumb file to proceed",
        no_file: "Please select a file to upload",
        thumbnail_error: "Unable to create thumbnail at the moment",
        added_success: "Added Successfully",
        thumbnail_generated: "Thumbnail generated",
        server_error: "server error",
        updated_sucessfully: "updated sucessfully",
        data: "Data fetched successfully",
        database_error: "Data fetch unsucessfull",
        data_retreive_sucess: "Data retrieve successfully",
        data_not_found: "Data not found",
        data_save: "Data Saved Successfully",
        save_failed: "Error Occured while saving Data",
        already_existed: "Data already existed",
        not_exist: "Data not existed",
        invalid_id: "invalid id",
        created_successfully: "created Successfully",
        update_sucess: "Updated Successfully",
        update_failed: "Error occured while updating",
        delete_failed: "Error occured while deleting",
        delete_sucess: "Deleted Successfully",
        img_save_err: "Error occured while saving Image",
        img_save_sucess: "Image Saved Successfully",


    },
    users: {
        email_already: "Email address is already occupied",
        valid_email: "Valid email !!! Go ahead",
        token_verification_sucess: "Valid token !!! Go ahead",
        phone_already: "Phone number is already occupied",
        valid_phone: "Valid phone number !!! Go ahead",
        username_already: "Username is already occupied",
        valid_username: "Valid username !!! Go ahead",
        invalid_old_password: "Invalid old password",
        password_change_failed: "Password Change Failed",
        password_change_successfull: "Password Changed Successfully",
        forgot_password_email_sent: "Forgot Password Email has been sent to your registered email address",
        forgot_password_email_error: "Error Occured while sending forgot password email",
        user_account_error: "Something wrong happens to user account",
        invalid_email: "Mentioned email is not registered with us",
        invalid_phone: "Mentioned phone is not registered with us",
        verification_email_sent: "Email Verification Link has been sent to your email address",
        verification_email_error: "Unable to send verification email to your email address",
        verification_sms_sent: "SMS Verification Code has been sent to your phone number",
        verification_sms_error: "Unable to send verification sms to your phone number",
        invalid_input_source: "Please select input source as email or phone",
        login_success: "User logged in successfully",
        register_error: "Error occured while register new user",
        register_success: "Register new user success",
        account_not_exist: "Account doesn't exist",
        invalid_credentials: "Invalid Password",
        account_disabled: "your account is disabled by administrator !!! contact to support",
        login_error: "Unable to login to your account",
        unauthorised_user: "Unauthorised user",
        invalid_user: "Invalid user",
        logout_success: "Logout Success",
        user_detail: "Here is a user details",
        user_account_updated: "User account updated",
        user_account_update_error: "Error while updating user account",
        users_list: "Here is a list of users",
        no_users: "No users available so far",
        missing_country_code: "Please enter country code along with phone number",
        invalid_otp: "Invaild OTP (One Time Password)",
        password_reset_success: "Password has been updated successfully",
        password_reset_error: "Unable to reset password at the moment",
        beyond_the_limit: "Sending update request out of the limit",
        invalid_login_source: "Please enter valid login source",
        username_suggestions: "choose any username from this list",
        following: "following",
        unfollowing: "unfollowed",
        comment_liked: "comment liked",
        comment_unliked: "comment unliked",
        comment_liked_failed: "comment liked failed",
        comment_unliked_failed: "comment unliked failed",
        error_following: "error while following this user",
        user_verified: "user verified successfully",
        basic_info_not_available: "Your Basic Info is not available",
        billing_info_not_available: "Your billing Info is not available",
        shipping_info_not_available: "Your shipping Info is not available",
        payment_info_not_available: "Your payment Info is not available",

    },
    product: {
        product_already_existed: "Product already existed",
        product_not_exist: "Product does not exist",
        product_varient_not_exist: "Product Varient does not exist",
        product_created: "Product Created Successfully",
        product_varient_save_fail: "Error occured while adding new Product Varient",
        product_varient_save: "Product Varient Created Successfully",
        product_save_failed: "Error occured while adding new Product",
        invalid_product_id: "Invalid Product Id",
        product_image_save_err: "Error while saving product image",
        product_image_saved: "Product Image Uploaded Successfully",
        varient_template_update_err: "Error while saving product template",
        varient_template_update: "Varient template Saved Successfully",
        varient_template_already: "Varient Template Already Exist",
        product_code_already: "Product Code Already Exist",
        product_title_already: "Product Title Already Exist",
        library_img_save_err: "Error occured while saving Library Image",
        active_product: "There Are Active Products in Subcategory Delete Product First"

    },
    category: {
        subcategory_already_existed: "Subcategory already existed",
        category_already_existed: "Category already existed",
        category_not_exist: "Category does not exist",
        subcategory_not_exist: "Subcategory does not exist",
        subcategory_added: "subcategory added Successfully",
        category_save_failed: "Error occured while adding new category",
        subcategory_save_failed: "Error occured while adding new Subcategory",
        category_added: "category added Sucessfully",
        subcategory_added: "Subcategory added Sucessfully",
        invalid_category_id: "Invalid Category Id",
        invalid_subcategory_id: "Invalid Subcategory Id",
        active_subcategory: "There Are Active Subcategory Delete Subcategory First"



    },
    material: {
        invalid_material_id: "Invalid Material Id",
        material_already: "material already exist",
        material_created: "material added Successfully",
        material_save_failed: "Error occured while adding new material",
        not_exist: "material not exist",


    },
    variable: {
        active_options: "There Are Active Options Delete Options First",
        variable_option_save_fail: "error while saving variable option",
        invalid_variable_type: "invalid Variable Type Id",
        invalid_variable_option: "invalid Variable Option Id",
        variable_option_already: "Variable Option Already Exist",
        variable_type_already: "Variable Type Already Exist",
        variable_type_save_failed: "Error occured while adding new variable type",
        variable_type_created: "variable type added Successfully",
        variable_option_created: "variable option added Successfully",


    },
    admin: {
        forgot_password_email_sent: "Forgot Password Email has been sent to your registered email address",
        forgot_password_email_error: "Error Occured while sending forgot password email",
        admin_account_error: "Something wrong happens to your account",
        invalid_email: "Mentioned email is not registered with us",
        login_success: "Administrator Login Success",
        login_error: "Unable to login at the moment",
        invalid_login: "Invalid credentials",
        admin_password_reset: "Password reset successfully",
        admin_password_reset_error: "Error while reset admin password",
        invalid_otp: "Invalid code (One Time Password)",
        admin_details: "Here is an admin details",
        invalid_admin: "Unauthorised access",
        password_changed: "Administrator password updated",
        password_change_error: "Error while updating administrator password",
        invalid_old_password: "Invalid old password",
        admin_details_updated: "Administrator details updated",
        admin_details_update_error: "Error while updating details",
        email_already: "Email address is already occupied",
        subAdmin_added: "SubAdmin Added Successfully",
        subAdmin_save_fail: "Error while Creating SubAdmin",


    },
    middleware: {
        use_access_token: "Please use access token for identification not refresh token",
        use_refresh_token: "Please use refresh token to refresh your access token",
        invalid_access_token: "Invalid access token",
        disabled_account: "Your account login has been disabled by admin !!! contact support",
        deleted_account: "Your account is deleted permanent !!! contact support",
        deactivated_account: "Your account is deactivated contact support",
        token_expired: "your token has been expired or not valid",
        access_refreshed: "Access token is refreshed",
        invalid_admin: "Invalid Admin",
        invalid_user: "Invalid User",



    },
    order: {
        order_created: "Order Placed Successfully",
        order_updated: "Order Updated Successfully",
        order_update_error: "Order Placed Successfully",
        order_failed: "Error while Placing Order",
        transactions: "transaction list",
        no_transaction: "no transaction",
    },
}