
import { FormSteps } from './config.js';

// ------------------ Add Purpose template html
let livestockPurposehtml = `<tr class="possegrid">
                                <td class="possegrid" valign="middle" colspan="1" rowspan="1" style="text-align: left" nowrap=""><span id="PurposeEdit_100536361_100379172_173010900_sp" name="PurposeEdit_100536361_100379172_173010900_sp" class="possegrid" style="text-align: left"><a data-id="PurposeEdit_Livestock and Animal_200_m3/year_173010900" id="PurposeEdit_100536361_100379172_173010900" name="PurposeEdit_100536361_100379172_173010900" class="possegrid" tabindex="14" title="Edit" target="_self" href="javascript:PossePopup('PurposeEdit_100536361_100379172_173010900',
                                        'editrelatedobject.aspx?PossePresentation=Default&amp;PosseObjectId=185527876&amp;SourceOfDiversion%3DGroundwater%26PostIssue11307%3DY',
                                            685, 800, 'PurposeEdit_100536361_100379172_173010900')">Edit</a></span></td>
                                <td class="possegrid" valign="middle" colspan="1" rowspan="1" style="text-align: left" nowrap=""><span id="PurposeUse_100536361_100379172_185527876_sp" name="PurposeUse_100536361_100379172_185527876_sp" class="possegrid" style="text-align: left">Livestock and Animal</span></td>
                                <td class="possegrid" valign="middle" colspan="1" rowspan="1" style="text-align: left" nowrap=""><span id="Units_100536361_100379172_185527876_sp" name="Units_100536361_100379172_185527876_sp" class="possegrid" style="text-align: left">{water_usage} m<sup>3</sup>/year </span></td>
                                <td class="possegrid" valign="middle" colspan="1" rowspan="1" style="text-align: left" nowrap=""><span id="ApplicationUnits_100536361_100379172_185527876_sp" name="ApplicationUnits_100536361_100379172_185527876_sp" class="possegrid" style="text-align: left"> </span></td>
                                <td class="possegrid" valign="middle" colspan="1" rowspan="1" style="text-align: right" nowrap=""><span id="ApplicationFee_100536361_100379172_185527876_sp" name="ApplicationFee_100536361_100379172_185527876_sp" class="possegrid" style="text-align: right">$250.00</span></td>
                                <td class="possegrid" valign="middle" colspan="1" rowspan="1" style="text-align: right" nowrap=""><span id="Delete_1_100536361_100379172_173010900_sp" name="Delete_1_100536361_100379172_173010900_sp" class="possegrid" style="text-align: right"><img src="images/btndel.gif?v=5797" width="23" height="20" id="Delete_1_100536361_100379172_173010900" name="Delete_1_100536361_100379172_173010900" class="possegrid" onclick="if (confirm('Are you sure you want to delete this?')) {PosseDelete('https://test.j200.gov.bc.ca/pub/delivery/vfcbc/Default.aspx?PossePresentation=Public&amp;PosseObjectId=173010563','173010900'); PosseSubmit();}" tabindex="3" title="Delete this line" alt="Delete" onmouseover="this.style.cursor='pointer'" onkeypress="if(event.keyCode=='13'){this.click();}"></span></td>
                            </tr>`


// ------------------ Form steps



function normalizeStepLabelToStepValue(label) {
    const raw = String(label || '').replace(/\u00a0/g, ' ').trim().toLowerCase();
    if (!raw) return null;

    const normalized = raw.replace(/[^a-z0-9]/g, '');
    if (!normalized) return null;

    let stepKey = normalized;
    if (stepKey === 'complete') {
        stepKey = 'step10complete';
    } else if (/^\d+/.test(stepKey)) {
        stepKey = `step${stepKey}`;
    }

    return FormSteps[stepKey] || stepKey;
}


function getStep3SubstepFromPaneHeader() {
    const paneHeaderText = getPreferredPaneHeaderText();
    if (!paneHeaderText) return null;

    const step3PaneHeaderMap = {
        governmentandfirstnationfeeexemptionrequest: FormSteps.STEP3_TECHNICAL_INFORMATION_FEE_EXEMPTION_REQUEST,
        waterdiversion: FormSteps.STEP3_TECHNICAL_INFORMATION_WATER_DIVERSION,
        works: FormSteps.STEP3_TECHNICAL_INFORMATION_WORKS,
        jointworks: FormSteps.STEP3_TECHNICAL_INFORMATION_JOINT_WORKS,
        damreservoir: FormSteps.STEP3_TECHNICAL_INFORMATION_DAM_RESERVOIR,
        landtenure: FormSteps.STEP3_TECHNICAL_INFORMATION_LAND_TENURE_OPTION,
        otherauthorizations: FormSteps.STEP3_TECHNICAL_INFORMATION_OTHER_AUTHORIZATIONS,
        // Add Well Popup
        well: FormSteps.STEP3_TECHNICAL_INFORMATION_ADD_WELL,
        // Add Surface Water Source Popup
        surfacewatersource: FormSteps.STEP3_ADD_SURFACE_WATER_SOURCE,
        
        // On the main form window; Not to be confused with the popup.
        sourceofwaterforapplication: FormSteps.STEP3_TECHNICAL_INFORMATION_SOURCE_OF_WATER_FOR_APPLICATION,
    };

    return step3PaneHeaderMap[paneHeaderText] || null;
}


function getPreferredPaneHeaderText() {
    const subHeader = document.querySelector('[data-id="subheadername"]');
    const subHeaderText = normalizeComparableValue(subHeader?.textContent || '');
    if (subHeaderText) return subHeaderText;

    const stepHeader = document.querySelector('[data-id="stepheadername"]');
    const stepHeaderText = normalizeComparableValue(stepHeader?.textContent || '');
    if (stepHeaderText) return stepHeaderText;

    return null;
}

function getCurrentFormStepFromPaneHeaders() {
    const paneHeaderText = getPreferredPaneHeaderText();
    if (!paneHeaderText) return null;

    const paneHeaderStepMap = {
        introduction: FormSteps.step1introduction,
        eligibility: FormSteps.step2eligibility,
        governmentandfirstnationfeeexemptionrequest: FormSteps.STEP3_TECHNICAL_INFORMATION_FEE_EXEMPTION_REQUEST,
        waterdiversion: FormSteps.STEP3_TECHNICAL_INFORMATION_WATER_DIVERSION,
        addapurpose: FormSteps.STEP3_ADDPURPOSE_CONSOLIDATED,
        step3works: FormSteps.STEP3_TECHNICAL_INFORMATION_WORKS,
        step3soureofwater: FormSteps.STEP3_TECHNICAL_INFORMATION_SOURCE_OF_WATER_FOR_APPLICATION,
        step3addsurfacewatersource: FormSteps.STEP3_ADD_SURFACE_WATER_SOURCE,
        step3jointworks: FormSteps.STEP3_TECHNICAL_INFORMATION_JOINT_WORKS,
        step3damreservoir: FormSteps.STEP3_TECHNICAL_INFORMATION_DAM_RESERVOIR,
        step3damreservoircontactindividual: FormSteps.STEP3_DAM_RESERVOIR_ADD_INDIVIDUAL,
        step3damreservoircontactindividualmailingaddress: FormSteps.STEP3_DAM_RESERVOIR_ADD_INDIVIDUAL_MAILING_ADDRESS,
        step3damreservoircontactorganization: FormSteps.STEP3_DAM_RESERVOIR_ADD_ORGANIZATION,
        step3addwell: FormSteps.STEP3_TECHNICAL_INFORMATION_ADD_WELL,
        step3landtenure: FormSteps.STEP3_TECHNICAL_INFORMATION_LAND_TENURE_OPTION,
        step3otherauthorizations: FormSteps.STEP3_TECHNICAL_INFORMATION_OTHER_AUTHORIZATIONS,
        step4location: FormSteps.STEP4_LOCATION,
        step4locationlanddetails: FormSteps.STEP4_LOCATION_LAND_DETAILS,
        step4locationotheraffectedlands: FormSteps.STEP4_LOCATION_OTHER_AFFECTED_LANDS,
        step5documentupload: FormSteps.STEP5_DOCUMENT_UPLOAD,
        step6privacydeclaration: FormSteps.STEP6_PRIVACY_CONFIRMATION,
        step7contactinformation: FormSteps.STEP7_CONTACT_INFORMATION,
        step8review: FormSteps.STEP8_REVIEW,
        step7referrals: FormSteps.STEP7_REFERRALS,
        step9declarations: FormSteps.STEP9_DECLARATIONS
    };
    return paneHeaderStepMap[paneHeaderText] || null;
}

function getCurrentFormStepFromDom() {
    const progressBar = document.getElementById('progressbar');
    if (!progressBar) {
        const hasAltchaValidation = Boolean(
            document.querySelector('span[id^="AltchaControl_"] script[src*="altcha.min.js"]')
        );
        const hasCaptchaIframeValidation = Boolean(
            document.querySelector('span[id^="Captcha_"] iframe#lanbotiframe')
        );
        if (hasAltchaValidation || hasCaptchaIframeValidation) {
            return FormSteps.step0bot || 'step0-Bot';
        }
        return getCurrentFormStepFromPaneHeaders();
    }

    const activeLi =
        progressBar.querySelector('li.crumbs_on') ||
        progressBar.querySelector('li.active') ||
        progressBar.querySelector('li[aria-current="step"]');

    if (!activeLi) {
        const hasAltchaValidation = Boolean(
            document.querySelector('span[id^="AltchaControl_"] script[src*="altcha.min.js"]')
        );
        const hasCaptchaIframeValidation = Boolean(
            document.querySelector('span[id^="Captcha_"] iframe#lanbotiframe')
        );
        if (hasAltchaValidation || hasCaptchaIframeValidation) {
            return FormSteps.step0bot || 'step0-Bot';
        }
        return getCurrentFormStepFromPaneHeaders();
    }

    const paneHeaderStep = getCurrentFormStepFromPaneHeaders();
    if (paneHeaderStep) {
        return paneHeaderStep;
    }

    const labelFromText = (activeLi.textContent || '').trim();
    const labelFromTitle = (activeLi.getAttribute('title') || '').trim();
    const currentStep = normalizeStepLabelToStepValue(labelFromText) || normalizeStepLabelToStepValue(labelFromTitle);
    if (!currentStep) return null;

    // Keep existing step detection, then refine STEP3 pages by pane header when known.
    if (normalizeComparableValue(currentStep).startsWith('step3')) {
        return getStep3SubstepFromPaneHeader() || currentStep;
    }

    return currentStep;
}

function normalizeComparableValue(value) {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}















/**
 * Bundling test cases
 */

// tenant-specific log
console.log('This is the water tenant bundle.');

const y = 1;
// console.log('x = ', x);
// console.log('y = ', y);

// method overrides.
function sharedMethod1() {
  console.log('override sharedMethod1 from tenant code');
}
sharedMethod1();

function sharedMethod2() {
  console.log('override sharedMethod2 from tenant code');
}
sharedMethod2();

// new method only for water tenant bundle
function newTenantMethod() {
  console.log('new tenant method');
}
newTenantMethod();
