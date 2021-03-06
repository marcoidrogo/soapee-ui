import React from 'react/addons';
import Reflux from 'reflux';
import cx from 'classnames';

import authStore from 'stores/auth';
import formLinkHandlers from 'mixins/formLinkHandlers';

import ValidateRecipeFormFields from 'services/validateRecipeFormFields';

import BootstrapModalLink from 'components/bootstrapModalLink';
import MarkdownEditor from 'components/markdownEditor';

import SignupOrLoginToSaveRecipe from 'modals/signupOrLoginToSaveRecipe';

export default React.createClass( {

    notes: null,

    mixins: [
        Reflux.connect( authStore, 'user' ),
        React.addons.LinkedStateMixin,
        formLinkHandlers
    ],

    getInitialState() {
        return {
            name: '',
            errors: {}
        };
    },

    render() {
        let  nameClasses = cx( 'form-group', {
            'has-error': this.state.errors.name
        } );

        return (
            <div className="form-save-recipe">
                <form className="form-horizontal" onSubmit={ (e) => e.preventDefault() }>
                    <fieldset>
                        <legend>Save recipe?</legend>

                        <div className="col-md-12">
                            <legend>Recipe Name</legend>
                            <div className={nameClasses}  >
                                <div className="col-lg-10">
                                    <input type="text"
                                           className="form-control"
                                           id="inputRecipeName"
                                           placeholder="Type recipe name"
                                           valueLink={ this.linkModel( this.props.recipe, 'name' ) }
                                        />

                                    { this.state.errors.name &&
                                        <span className="label label-danger animate bounceIn">{ this.state.errors.name[ 0 ]}</span>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="col-md-12">
                            <legend>Recipe Description</legend>
                            <MarkdownEditor
                                className="input-description"
                                valueLink={ this.linkModel( this.props.recipe, 'description' ) }
                                placeholder="Add a short description"
                                />
                        </div>

                        <div className="col-md-12">
                            <legend>Recipe Notes / Method </legend>
                            <MarkdownEditor
                                className="input-description"
                                valueLink={ this.linkModel( this.props.recipe, 'notes' ) }
                                placeholder="Describe how the recipe is prepared; mention anything interesting or relevant to this recipe"
                                />
                        </div>

                        <div className="col-md-12">
                            <div className="form-group">
                                <legend>Recipe Visibility</legend>
                                <label className="radio-inline">
                                    <input type="radio" name="uom" value="percent" checkedLink={this.radioModel( this.props.recipe, 'visibility', 0 )} /> Private - only visible to you
                                </label>
                                <label className="radio-inline">
                                    <input type="radio" name="uom" value="percent" checkedLink={this.radioModel( this.props.recipe, 'visibility', 2 )} /> Friends - also visible to your friends
                                </label>
                                <label className="radio-inline">
                                    <input type="radio" name="uom" value="percent" checkedLink={this.radioModel( this.props.recipe, 'visibility', 1 )} /> Public - visible to everyone
                                </label>
                            </div>
                        </div>

                        <div className="col-sm-12">
                            <div className="btn-toolbar action-buttons">
                                {this.renderSaveRecipeButton()}
                                { this.props.buttonPrint && <button className="btn btn-primary" onClick={ this.printRecipe }><i className="fa fa-print"> Print Recipe</i></button> }
                                { this.props.buttonCancel && <button className="btn btn-primary" onClick={ this.cancelEditing }><i className="fa fa-ban"> Cancel Editing</i></button> }

                            </div>
                        </div>

                    </fieldset>
                </form>
            </div>
        );
    },

    renderSaveRecipeButton() {
        let nameMissing = !(this.props.recipe.getModelValue( 'name' ));
        let buttons = [];

        if ( authStore.isAuthenticated() ) {
            buttons.push( <button className="btn btn-primary" key="btn-save" onClick={ this.saveRecipe } disabled={nameMissing}><i className="fa fa-cloud"> Save Recipe</i></button> );

            if ( this.props.recipe.getModelValue( 'id' )
                && authStore.isMyId(this.props.recipe.getModelValue( 'user_id' )  ) ) {
                buttons.push( <button className="btn btn-primary" key="btn-save-as" onClick={ this.saveCopyRecipe } disabled={nameMissing}><i className="fa fa-clone"> Save As Copy</i></button> );
            }

            return buttons;
        } else {
            return (
                <BootstrapModalLink
                    elementToClick={<button className="btn btn-primary" disabled={nameMissing}><i className="fa fa-cloud"> Save Recipe</i></button>}
                    modal={SignupOrLoginToSaveRecipe}
                    />
            );
        }
    },

    saveRecipe() {
        this.setState( {
            errors: {}
        } );

        this.validateForm( this )
            .then( this.props.onSave )
            .catch( setErrors.bind( this ) );
    },

    saveCopyRecipe() {
        this.setState( {
            errors: {}
        } );

        this.validateForm( this )
            .then( this.props.onSaveAs )
            .catch( setErrors.bind( this ) );
    },

    validateForm() {
        return new ValidateRecipeFormFields( {
            name: this.props.recipe.getModelValue( 'name' )
        } )
            .execute();
    },

    printRecipe() {
        setTimeout( () => {
            this.props.onPrint();
        } );
    },

    cancelEditing() {
        this.props.onCancel();
    }

} );

///////////////
///

function setErrors( e ) {
    if ( e.name === 'CheckitError' ) {
        this.setState( {
            errors: e.toJSON()
        } );
    }
}
