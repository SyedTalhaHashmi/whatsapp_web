const getAccountsListByProfileId = async () => {
  console.log("globalstate", user);
  try {
    const response = await axios.get(
      `https://khata-backend-express.vercel.app/api/accounts/by-profile/${localStorage.getItem(
        "account"
      )}`
    );

    console.log("pak", response.data[0].profileId);

    const accountData = response.data;

    // setUserDataContext({ ...userData, accountId: accountData[0] });
    setOptions(accountData);
    console.log("Accounts:", accountData);
    // console.log("Accountsabc:", response.data[0].customers[0].accountId);
  } catch (error) {
    console.error("Error fetching accounts by profile ID:", error);
  }
};
