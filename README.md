# Are They Awake Yet? GitHub Action

What time is it for the person you are tagging in a GitHub issue or pull request? This action will tell you the time and date for the user you mention in an issue or pull request.

* [Usage](#usage)
* [License](#license)

## Usage

To use this action in your project, please follow the [instructions on GitHub](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/configuring-a-workflow) for initiating a workflows folder structure in your repository, if you have not done so already. 

Once you have your workflow structure set up, you can create a new workflow YAML file inside `/.github/workflows/` that contains the following:

``` 
name: Check Inclusive Language
on: [issues, pull_request]
jobs:
  are-they-awake-yet:
    runs-on: ubuntu-latest
    steps:
    - name: are-they-awake-yet
      uses: benhayehudi/awake-yet-action@master
    env:
      GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
```

The last step is you need to add your Google Maps API key to your GitHub repository secrets configuration. Follow [this guide](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) on how to do so. You need to save it with the following key: `GOOGLE_API_KEY`.

At this point, any `opened`, `reopened`, `created` or `edited` event `action` will trigger the action to post a comment either with the requested user's date and location in their location or letting you know that they do not specify a location in their profile..

## License

This project is under the [MIT License](LICENSE.txt)