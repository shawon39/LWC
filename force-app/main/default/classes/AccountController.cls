public with sharing class AccountController {
    @AuraEnabled(Cacheable=true)
    public static List<Account> getAccounts(){
        List<Account> accList = [SELECT Id, Name, NumberOfEmployees, AnnualRevenue, Industry, Phone, Type FROM Account];
        return accList;
    }

    @AuraEnabled(Cacheable=true)
    public static List<Account> filterAccounts(List<String> filterValues, Integer rowLimit, Integer offSet) {
        List<Account> accList = [SELECT Id, Name, NumberOfEmployees, AnnualRevenue, Industry, Phone, Type, CreatedDate, CreatedById,Account__c, Account__r.Name FROM Account ORDER BY CreatedDate NULLS LAST LIMIT:rowLimit  OFFSET: offSet];
        return accList;
    }

    @AuraEnabled(Cacheable=true)
    public static Integer getTotalNumberOfRows(){
        Integer totalNumberOfRows = [SELECT COUNT() FROM Account];
        return totalNumberOfRows;
    }
}
