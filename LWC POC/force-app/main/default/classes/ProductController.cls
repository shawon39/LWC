public class ProductController {
    @AuraEnabled
    public static List<Product2> searchProduct(String Keyword,String Orderby, String OrderDir, String objectApiName, String limitSize, String offset){
        System.debug('hello world: '+objectApiName);
        System.debug('Orderby: '+Orderby);
        System.debug('OrderDir: '+OrderDir);
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Map<String, Schema.SObjectField> fieldMap = schemaMap.get(objectApiName).getDescribe().fields.getMap();
        String strFields = '';
        for(String fieldName : fieldMap.keyset()){
            if(strFields == null || strFields == ''){
                strFields = fieldName;
            } else{
                strFields = strFields + ' , ' + fieldName;
            }
        }
        String query = 'SELECT '+strFields+'  FROM '+objectApiName;
        String searchKeyword = '\'%'+Keyword+'%\'';
        query = query + ' WHERE Name LIKE ' +searchKeyword + ' ORDER BY ' + Orderby + ' ' + OrderDir + ' NULLS LAST ' 
        + ' LIMIT ' + limitSize + ' OFFSET ' + offset;
        List<Product2> productList = new List<Product2>();
        System.debug('query: '+query);
        productList = Database.query(query);
        System.debug('productList: '+productList);
        return productList;
    }
}
