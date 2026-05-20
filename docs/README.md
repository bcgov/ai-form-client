# Onboarding Tenants to AI Form Assist


## Create a RAG knowledge resource

* Upload documents to Storage > Storage Account > Blob Storage
* To manage AI Search service, connect to Azure Portal using UDP [via Bastion](https://portal.azure.com/#@bcgov.onmicrosoft.com/resource/subscriptions/56358ccd-64df-4586-98cc-f472e4c7323f/resourceGroups/d94cca-dev-networking/providers/Microsoft.Compute/virtualMachines/css-ai-dev-window/bastionHost)
* In [AI Search service](https://portal.azure.com/#@bcgov.onmicrosoft.com/resource/subscriptions/56358ccd-64df-4586-98cc-f472e4c7323f/resourceGroups/d94cca-dev-networking/providers/Microsoft.Search/searchServices/css-ai-dev-aisearch/overview), click on 'import data' and follow wizard:
  * Choose Azure Blob Storage
  * RAG
  * choose a storage account and blob container (pre-configured)
  * Authenticate using managed identity > System-assigned
  * choose LLM service (eg: openai)
  * choose embedding (eg: text-embedding-3-large)

* After the wizard has created the data source, index, skillset, go into the new index, click 'edit JSON' and set the parameters.configuration.excecutionEnvironment: "private"
* Go into the new indexer and 'Run' (repeat as required)

## Configure nr-ai-form API to use resources for a specific tenant

